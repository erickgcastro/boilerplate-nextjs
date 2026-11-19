# Ferramentas e qualidade

## Ambiente

- Node 22.12 ou mais novo (mínimo exigido pelo commitlint). O `engines` do `package.json` só avisa, não bloqueia o `npm install`.
- TypeScript 7 em modo `strict`, com `noImplicitAny: false`.
- Toda linha termina em LF: o `.gitattributes` força isso no Git e o `.editorconfig`, no editor.

## Biome

O Biome faz lint e formatação e substitui o ESLint e o Prettier. A configuração fica em `biome.json`:

- Verifica só arquivos JS e TS e respeita o `.gitignore`.
- Lê a indentação do `.editorconfig`: 2 espaços.
- Ativa as regras recomendadas e os domínios `next` e `react`.
- `any` explícito, imports e variáveis não usados são erro, e `biome check` também organiza os imports.
- Regras desligadas: `noNonNullAssertion`, `noNonNullAssertedOptionalChain` e `noStaticOnlyClass` (os services são classes só com métodos estáticos).

No VS Code, o formatter padrão é a extensão do Biome (`biomejs.biome`).

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (Turbopack) |
| `npm run build` | build de produção |
| `npm run start` | serve o build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `biome check` no projeto |
| `npm run lint:strict` | `biome check` em `src`, falhando também em warning |
| `npm run format` | formata `src` |
| `npm run format:check` | verifica a formatação de `src` |

## Git hooks (husky)

| Hook | O que roda |
| --- | --- |
| `pre-commit` | `lint-staged`, que roda `biome check --write` nos arquivos staged |
| `commit-msg` | `commitlint` |
| `pre-push` | `lint:strict`, `typecheck`, `format:check` e `build` |

Os hooks são instalados pelo script `prepare` durante o `npm install`.

## Commits

O commitlint usa `@commitlint/config-conventional`:

- Formato `tipo: descrição`, com a descrição começando em minúscula, e cabeçalho de até 100 caracteres.
- Tipos aceitos: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`, `perf`, `build`, `ci` e `revert`.
