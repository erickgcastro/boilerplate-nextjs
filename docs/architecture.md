# Arquitetura

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript 7, TanStack Query 5, zustand 5, axios, next-intl 4, Tailwind CSS 4, shadcn/ui, zod e react-hook-form.

## Estrutura de pastas

```
src/
├── app/
│   ├── (frontend)/            # route group das páginas (não aparece na URL)
│   │   ├── globals.css        # Tailwind e tokens de tema
│   │   └── [locale]/          # toda página fica sob o locale
│   └── api/                   # route handlers, sem locale
├── components/                # componentes compartilhados do projeto
│   └── ui/                    # componentes gerados pelo shadcn
├── config/                    # instâncias configuradas (cliente axios)
├── domain/<modulo>/           # um módulo por domínio de negócio (ver domain.md)
├── i18n/                      # configuração do next-intl
├── lib/                       # utilitários e constantes sem regra de negócio
│   ├── hooks/                 # hooks de UI reutilizáveis (useDebouncedValue)
│   └── stores/                # stores zustand de estado de cliente
├── providers/                 # providers React
├── repository/                # todas as chamadas HTTP, um service por recurso
├── services/                  # classe base e helpers dos services HTTP
└── proxy.ts                   # proxy do Next 16 (antigo middleware)
public/locales/<locale>/       # arquivos de tradução
```

O alias `@/*` aponta para `src/*`.

## Camadas e fluxo de dados

```
página / componente  →  hook do domínio (React Query)  →  service de repository  →  httpClient (axios)  →  API
```

- Página e componente não chamam axios nem o service direto: usam os hooks de `domain/<modulo>/hooks`.
- O hook não monta URL: chama um método do service.
- Toda chamada HTTP fica em `src/repository/`. Nenhuma outra pasta importa o `httpClient`.
- O service não guarda estado: é uma classe só com métodos estáticos.
- `domain/` importa de `repository/`, `services/` e `lib/`, nunca de `app/` ou `components/`.
- `repository/` importa de `domain/` só os tipos (entities e DTOs).

Detalhes de cada camada em [domain.md](domain.md).

## Estado de cliente

- Dado que vem da API fica no cache do React Query, nunca em store.
- Estado de um componente só fica em `useState`.
- Estado de cliente usado por vários componentes fica em uma store zustand em `src/lib/stores/`, um arquivo por store, exportando um hook `use<Nome>`.

```ts
// src/lib/stores/filters.ts
import { create } from "zustand";

interface FiltersState {
  search: string;
  setSearch: (search: string) => void;
}

export const useFilters = create<FiltersState>((set) => ({
  search: "",
  setSearch: (search) => set({ search }),
}));
```

No componente, leia um valor por seletor, para ele só renderizar de novo quando esse valor mudar:

```tsx
const search = useFilters((state) => state.search);
```

Store que precisa sobreviver ao reload usa o middleware `persist` e valida com zod o que volta do `localStorage`. `src/lib/stores/settings.ts` é o modelo: se o valor salvo não passar no schema, valem os valores padrão.

Fora de um componente (em um callback do React Query, por exemplo), leia ou altere a store por `use<Nome>.getState()`. `src/lib/stores/logout.ts` faz isso em `redirectToLogout`.

## Rotas

Página nova é uma pasta dentro de `[locale]`. Por exemplo, uma listagem de produtos com página de detalhe:

```
src/app/(frontend)/[locale]/products/page.tsx        →  /en/products, /pt-br/products
src/app/(frontend)/[locale]/products/[id]/page.tsx   →  /en/products/42
```

No Next 16, `params` e `cookies()` são Promises:

```tsx
export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  // ...
}
```

Route handler fica em `src/app/api/<rota>/route.ts` e não tem locale, porque o proxy ignora `/api`:

```ts
// src/app/api/health/route.ts  →  GET /api/health
export function GET() {
  return Response.json({ ok: true });
}
```

- O layout raiz em `[locale]/layout.tsx` valida o locale e monta os providers. Provider novo entra ali.
- Arquivo que usa hook (estado, efeito, React Query, router) começa com `"use client"`.

## Erros

- Erro que vale para a aplicação inteira (sessão expirada, por exemplo) é tratado uma vez, no `QueryCache` e no `MutationCache` de `src/providers/query-provider.tsx`, e não em cada hook.
- No 401, o provider chama `redirectToLogout` de `src/lib/stores/logout.ts`. Ela liga o `LogoutOverlay`, montado no layout raiz, e carrega `/api/logout`. Um botão de sair usa a mesma função.
- Erro de uma tela é tratado no componente, com `try/catch` em volta do `mutateAsync` ou com o `isError` da query. A mensagem vem do i18n.
