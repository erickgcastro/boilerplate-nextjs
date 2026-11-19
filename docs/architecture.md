# Arquitetura

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript 7, TanStack Query 5, axios, next-intl 4, Tailwind CSS 4, shadcn/ui, zod e react-hook-form.

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
├── providers/                 # providers React
├── services/                  # classe base e helpers dos services HTTP
└── proxy.ts                   # proxy do Next 16 (antigo middleware)
public/locales/<locale>/       # arquivos de tradução
```

O alias `@/*` aponta para `src/*`.

## Camadas e fluxo de dados

```
página / componente  →  hook do domínio (React Query)  →  service do domínio  →  httpClient (axios)  →  API
```

- Página e componente não chamam axios nem o service direto: usam os hooks de `domain/<modulo>/hooks`.
- O hook não monta URL: chama um método do service.
- O service não guarda estado: é uma classe só com métodos estáticos.
- `domain/` importa de `services/`, `config/` e `lib/`, nunca de `app/` ou `components/`.

Detalhes de cada camada em [domain.md](domain.md).

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
- Erro de uma tela é tratado no componente, com `try/catch` em volta do `mutateAsync` ou com o `isError` da query. A mensagem vem do i18n.
