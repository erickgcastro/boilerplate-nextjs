# Instruções para agentes de IA

> Regras para qualquer agente de IA que trabalhe neste projeto. Os padrões detalhados estão nos documentos de `docs/` (seção 7).

---

## 1. Ao receber uma tarefa

Antes de escrever código:

1. Leia os documentos de `docs/` ligados à tarefa. Página ou rota nova: [architecture.md](docs/architecture.md). Dado vindo da API: [domain.md](docs/domain.md). Texto na tela: [i18n.md](docs/i18n.md). Componente ou estilo: [ui.md](docs/ui.md).
2. Procure o que já existe antes de criar: componentes em `src/components/ui/`, utilitários em `src/lib/`, stores em `src/lib/stores/`, services em `src/repository/` e hooks em `src/domain/`. Se o shadcn tiver o componente, adicione pela CLI em vez de escrever um.
3. Liste tudo que a mudança precisa tocar: entity, DTO, service, hooks, componentes, página e as traduções de todos os locales.
4. Se o pedido for ambíguo, ou se a tarefa exigir algo da seção 4 (dependência nova, mudança de configuração), pergunte antes de seguir.

---

## 2. Arquitetura

- O fluxo de dados é sempre página/componente → hook do domínio → service de `src/repository/` → `httpClient`. Nunca chame axios ou o service direto de uma página ou componente.
- Toda chamada HTTP fica em `src/repository/`, um `<recurso>.service.ts` por recurso, registrado em `src/repository/index.ts`.
- Módulo de domínio novo segue a mesma estrutura de pastas dos existentes (`entities/`, `dto/`, `hooks/`).
- Dado da API fica no React Query. Estado de cliente compartilhado fica em uma store zustand em `src/lib/stores/`.
- Página nova fica em `src/app/(frontend)/[locale]/`; route handler, em `src/app/api/`.
- Next 16: o middleware se chama `src/proxy.ts`, `params` e `cookies()` são Promises e `next lint` não existe.
- Erro global (como sessão expirada) é tratado no `QueryProvider`; erro de tela, no componente.

---

## 3. Código

### TypeScript

- Não use `any` (o Biome acusa erro). Use tipos concretos, genéricos ou `unknown` com narrowing.
- `@ts-ignore` e `@ts-expect-error` só com um comentário explicando o motivo.
- Métodos de service declaram o tipo de retorno (`Promise<Product>`).
- DTO é um schema zod com o tipo exportado via `z.infer`.
- Função nova com mais de um parâmetro: prefira um objeto de parâmetros nomeados.
- Importe pelo alias `@/*`, não por caminhos relativos que saem da pasta do módulo. Os services vêm de `@/repository`.

### Convenções

- Arquivos em kebab-case (`delete-product-button.tsx`, `product.service.ts`).
- Componentes, classes e tipos em PascalCase; variáveis e funções em camelCase; hooks começam com `use`.
- Formatação é do Biome: 2 espaços, aspas duplas, ponto e vírgula.
- Nenhum texto visível fixo no JSX: toda string vai para `public/locales/<locale>/`, em todos os locales.
- Navegação usa `@/i18n/navigation`. A exceção são route handlers de `/api`, que usam `window.location.assign`.
- Cores usam os tokens do tema (`bg-background`, `text-foreground`, `bg-muted`...), nunca cores fixas.
- Commits seguem Conventional Commits (`tipo: descrição`).

---

## 4. O que não fazer

- Não instale dependência sem justificativa clara.
- Não altere `tsconfig.json`, `biome.json`, `next.config.ts` ou `components.json` sem aprovação.
- Não crie arquivos fora da estrutura de pastas descrita em [architecture.md](docs/architecture.md).
- Não duplique o que já existe em `src/lib/` ou `src/components/ui/`.
- Não ignore erros em silêncio: trate, mostrando uma mensagem do i18n, ou propague.
- Não use ESLint nem Prettier.
- Não edite arquivos gerados (`.next/`, `next-env.d.ts`).

---

## 5. Validação ao terminar

> [!CAUTION]
> Toda tarefa só está pronta com estes comandos passando sem erros nem warnings.

```bash
npm run lint:strict
npm run typecheck
npm run build
```

- Problema de formatação se corrige com `npm run format`.
- Se a mudança aparece na tela, abra a página com `npm run dev` e confira nos dois idiomas e nos dois temas.

---

## 6. Stack

| Ferramenta | Uso |
| --- | --- |
| Next.js 16 | framework (App Router, Turbopack) |
| React 19 | UI |
| TypeScript 7 | linguagem (strict) |
| TanStack Query 5 | cache e estado de dados da API |
| zustand 5 | estado de cliente compartilhado |
| axios | cliente HTTP |
| next-intl 4 | internacionalização |
| Tailwind CSS 4 | estilos |
| shadcn/ui | componentes base |
| zod | schemas dos DTOs |
| react-hook-form | formulários |
| Biome | lint e formatação |

---

## 7. Documentação

- [Arquitetura](docs/architecture.md): estrutura de pastas, camadas, rotas e erros.
- [Módulos de domínio](docs/domain.md): entities, DTOs, services, hooks e como criar um módulo novo.
- [Internacionalização](docs/i18n.md): locales, proxy, arquivos de mensagem e navegação.
- [UI e estilos](docs/ui.md): Tailwind 4, tokens de tema, tema escuro, shadcn e componentes do projeto.
- [Ferramentas](docs/tooling.md): Node, TypeScript, Biome, scripts, git hooks e commits.
