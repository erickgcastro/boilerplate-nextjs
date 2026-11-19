# Comparação de arquiteturas de frontend

Compara duas arquiteturas para um projeto web em React e Next.js:

- **A, "domínio + hooks"**: a deste repositório, descrita em [docs/architecture.md](docs/architecture.md) e [docs/domain.md](docs/domain.md). O projeto barlav (`apps/web`) usa o mesmo conceito.
- **B, "camadas MVVM"**: o perfil `stacks/react-zustand` do kit `frontend-architecture` do projeto pixlog.

O critério é um só: o que cada uma custa e entrega em um projeto **web** com Next.js App Router. Onde uma é melhor, o texto diz, inclusive contra a arquitetura deste repositório.

## Resumo

- A arquitetura A é mais curta e não fecha a porta para o servidor do Next.js. Ela não define onde fica regra de negócio, não valida o que a API devolve e não tem testes.
- A arquitetura B é mais rigorosa e testável. Ela trata o Next.js como roteador de uma aplicação cliente: proíbe buscar dados no servidor, coloca a aplicação inteira atrás de um boot no cliente e carrega camadas que só se pagam em apps com lógica pesada no cliente.
- Para o projeto web típico (telas sobre uma API REST, com as regras de negócio no backend), **A é a base mais adequada**, desde que receba cinco ideias da B listadas em [Recomendação](#recomendação).
- A B passa a fazer sentido quando o frontend é, de fato, um aplicativo: offline, sincronização em segundo plano, várias fontes de dados ou paridade com um app Flutter que usa as mesmas camadas.

## As duas em uma tela

| | A: domínio + hooks | B: camadas MVVM |
|---|---|---|
| Fluxo | página → hook do domínio → service do domínio → `httpClient` | View → ViewModel → Use Case → Repository → Data Source |
| Organização de pastas | por domínio (`src/domain/<modulo>/`), com o HTTP em `http/` dentro de cada módulo | por camada (`src/use-cases/`, `src/repositories/`, ...) |
| Unidade de acesso a dados | classe com métodos estáticos | classe com interface, recebendo dependências no construtor |
| Criação de instâncias | nenhuma: imports e um `httpClient` de módulo | container manual em `src/wiring/`, entregue por React Context |
| Regra de negócio | sem lugar definido | Use Case, obrigatório |
| Resposta da API | interface TypeScript, sem validação | schema zod, validado no Repository |
| Erros | `AxiosError` chega até o provider e o componente | erros tipados; o ViewModel devolve chave de tradução |
| Estado de servidor | TanStack Query, exposto direto ao componente | TanStack Query, escondido atrás do ViewModel |
| Estado de cliente compartilhado | zustand, em `src/lib/stores/` | zustand, em `*.state.ts` ao lado da View, sem `persist` |
| Server Components | permitidos, mas o fluxo documentado passa por hooks de cliente | proibidos de ler dados |
| Inicialização | nenhuma: a página renderiza | boot em duas fases, no cliente, antes de qualquer tela |
| Sessão | cookies, com logout por route handler; o interceptor de token ainda é um TODO | token lido no cliente; libs de sessão no servidor são desaconselhadas |
| i18n | next-intl, com locale na rota | i18next e react-i18next, no cliente |
| Testes | não configurados | Vitest e Testing Library, com fakes por interface |
| Arquivos para "listar pedidos" | 3 (entity, service, hooks) mais a página | 8 (DTO, interface, repository, use case, wiring, keys, view-model, screen) mais a página |

## De onde vem a arquitetura B

O kit tem um núcleo neutro (`core/`) e um perfil por stack. O núcleo nasceu em Flutter, e isso aparece no texto:

- Os papéis (View, ViewModel, Repository, Data Source, Service) são os da arquitetura de apps recomendada para Android e Flutter.
- Os exemplos do núcleo falam de sensores do dispositivo, armazenamento seguro, share sheet da plataforma e sincronização em segundo plano, com pastas em snake_case (`password_reset/`).
- O boot em fases (armazenamento, sessão, configurações, depois os serviços) é o ciclo de vida de um app instalado, que abre uma vez e fica vivo.

O perfil React traduz esses papéis com cuidado: usa TanStack Query nos ViewModels, `useSyncExternalStore` para estado mantido em Use Case e trata a pré-renderização no servidor. A tradução é bem feita. O que ela não muda é o pressuposto de origem: o cliente é dono do estado e da lógica, e o servidor só entrega o pacote.

Na web com Next.js, esse pressuposto nem sempre vale, e é daí que saem os principais contras da B.

## Arquitetura A: domínio + hooks

O barlav (`apps/web`) mostra o mesmo conceito em um projeto maior: hooks por domínio, HTTP concentrado em um pacote (`@barlav/sdk`), stores zustand em `lib/stores/` e, em `lib/errors/`, um helper que traduz o código de erro da API para uma chave do i18n. Este repositório segue a mesma direção nas stores (`src/lib/stores/`), mas mantém o HTTP dentro de cada módulo, em `src/domain/<modulo>/http/`.

### Prós

- **Pouco código por funcionalidade.** Um recurso novo são três ou quatro arquivos, todos em `src/domain/product/`: entity, DTO, service e hooks.
- **Divisão de código por rota.** A página importa só os hooks do domínio que usa, e o bundler entrega só isso naquela rota.
- **Usa o TanStack Query inteiro.** O componente recebe o objeto da query, então `isFetching`, `select`, paginação infinita, suspense e atualização otimista funcionam sem nada a mais.
- **Perto do Next.js.** Locale na rota com next-intl, logout por route handler que apaga os cookies, e a página renderiza sem etapa de boot. Os services não dependem de React, então rodar um deles no servidor é uma mudança pequena.
- **Query key ligada ao método.** `Key(Service.product, "getAllProducts")` é checada pelo TypeScript: renomear o método quebra a compilação em vez de quebrar o cache.
- **Curva de entrada baixa.** Quem conhece React Query entende o projeto em minutos.

### Contras

- **Regra de negócio não tem endereço.** Enquanto o frontend só exibe e envia dados, isso não aparece. Quando surgir uma regra de verdade (cálculo, permissão, fluxo com vários passos), ela vai parar no componente ou no hook, misturada com React.
- **A resposta da API não é validada.** `Promise<Product>` é uma promessa do TypeScript, não uma checagem. Se o backend mudar um campo, o erro aparece longe da origem, em algum componente.
- **Axios vaza para cima.** O `QueryProvider` importa `AxiosError` para detectar o 401, e um componente que queira distinguir erros precisa conhecer o axios também.
- **Testar exige mock de módulo.** Service estático com `httpClient` importado não aceita um substituto por parâmetro. O caminho é `vi.mock` ou interceptar a rede (MSW). Hoje não há nenhum teste configurado.
- **Chaves de query planas.** A chave é uma string só (`"@product:getAllProducts"`), então não dá para invalidar "tudo de produto" pelo prefixo. Cada mutation lista as queries que afeta, e esquecer uma deixa dado velho na tela.
- **Unicidade manual da `key`.** Dois services com a mesma `key` colidem no cache sem aviso. O próprio exemplo do repositório mostra o risco: `ExampleService` usa a key `"@user"`.
- **Algumas cerimônias sem retorno.** `httpClient[HttpMethods.GET](path)` no lugar de `httpClient.get(path)`, e duas classes chamadas `Service` (a base em `@/services` e o registro em `http/index.ts` de cada módulo).
- **Dados só no cliente, hoje.** A regra "página → hook → service" e o `"use client"` no topo de `axios-client.ts` impedem chamar um service em Server Component. Liberar prefetch no servidor é um ajuste pequeno, mas é uma mudança de regra, e até lá o projeto não aproveita SSR de dados.

## Arquitetura B: camadas MVVM

### Prós

- **Regra de negócio tem dono.** Toda decisão fica em um Use Case, uma classe sem React. Dá para ler, testar e reusar a regra sem montar componente.
- **Testabilidade alta.** Repository e Data Source têm interface. O teste troca só a camada mais baixa (`createContainer({ httpClient: fake })`) e roda a cadeia real por cima, sem mock de módulo.
- **Fronteira validada.** O Repository faz `Schema.parse(json)`. Um contrato quebrado falha na borda, com mensagem clara.
- **Erros tipados.** O Data Source converte a falha do SDK em `NetworkError` ou `ApiError`. Nada acima dele conhece o axios, e a View recebe uma chave de tradução pronta.
- **Chaves de query hierárquicas.** `ordersKeys.all = ["orders"]` permite invalidar o domínio inteiro, e o `DataChangeSignal` usa isso para atualizar todas as telas depois de qualquer mudança.
- **Troca de fornecedor localizada.** Sair do Firebase ou do axios muda um Data Source.
- **Regras explícitas de quem importa quem.** Em time grande, ou com agentes de IA escrevendo código, isso reduz a variação entre uma funcionalidade e outra. O kit foi escrito para esse uso.
- **Vocabulário comum com o mobile.** Se a empresa tem um app Flutter com as mesmas camadas, as pessoas trocam de projeto sem reaprender a estrutura.

### Contras

- **Abre mão do servidor.** "Server Components nunca leem dados" descarta busca no servidor, streaming e prefetch com hidratação. Sobra do Next.js o roteador e o build, e para isso um SPA com Vite seria mais simples. A A também busca no cliente hoje, mas ali é uma regra a mudar. Aqui é estrutural: o container vive em Context, o token fica no browser e o boot roda antes de tudo.
- **Boot bloqueia a primeira renderização.** O `AppRoot` mostra o `BootShell` até o boot terminar no cliente. Toda rota, inclusive as públicas, chega ao usuário e aos buscadores como uma tela de carregamento. Em página pública ou com SEO, isso é um defeito.
- **O container vai inteiro para o bundle inicial.** `providers.tsx` importa `createContainer`, que importa todos os Use Cases, Repositories e Data Sources da aplicação. O JavaScript da primeira página cresce com o tamanho do sistema, não com o que a rota usa.
- **Use Cases que só repassam.** Em CRUD com as regras no backend, `ListOrdersUseCase.execute()` chama `repository.listOrders()` e mais nada. Como pular camada é proibido, o arquivo existe mesmo vazio de decisão.
- **Muito arquivo por funcionalidade.** Cerca de oito arquivos, em seis pastas diferentes, para uma listagem. Seguir um recurso de ponta a ponta exige navegar pelo projeto inteiro.
- **O ViewModel esconde o TanStack Query.** Como a View não recebe o objeto da query, cada recurso (paginação infinita, `isFetching`, otimista) precisa ser reexposto à mão, tela por tela.
- **Sessão no cliente.** O perfil lê o token por um Data Source no browser e desaconselha libs de sessão no servidor. Na web, cookie `httpOnly` protege melhor contra XSS do que token acessível por JavaScript, e é o que o Next.js facilita.
- **Peças sem uso na web comum.** Repositories locais, Services com `start()` e `stop()`, signals e coordinators resolvem offline, sincronização e ciclos de dependência. Em um painel sobre REST, ficam como estrutura sem conteúdo.
- **i18n só no cliente.** No perfil, o i18next roda em componentes de cliente: não há locale na rota nem tradução em Server Component, que o next-intl dá de fábrica.
- **Rigor depende de disciplina.** O README do kit avisa que as regras são contexto para o agente, não verificação. Sem lint de imports ou CI, as camadas se desfazem com o tempo.

## Quando cada uma faz sentido

| Situação do projeto | Melhor base |
|---|---|
| Painel, backoffice ou site sobre API REST, com as regras no backend | A |
| Páginas públicas, SEO ou tempo de primeira renderização importam | A, com prefetch no servidor liberado |
| Time pequeno, prazo curto, boilerplate para vários projetos | A |
| Offline, PWA, sincronização em segundo plano | B |
| Regra de negócio pesada no cliente (cálculo, fluxos longos, várias fontes de dados) | B |
| Firebase, IndexedDB e REST juntos, com chance de trocar algum | B |
| App Flutter com as mesmas camadas e pessoas que transitam entre os dois | B |
| Exigência de cobertura de testes da lógica sem browser | B, ou A com as adoções abaixo |

## Recomendação

Para um boilerplate React e Next.js voltado à web, **manter a A como base e trazer da B o que resolve os contras reais da A**, sem trazer as camadas:

1. **Validar a resposta da API.** A entity vira um schema zod, e o service faz `schema.parse(data)`. O tipo continua saindo de `z.infer`, como já acontece nos DTOs.
2. **Chaves de query hierárquicas.** O domínio como primeiro elemento (`["product", "list"]`), para invalidar por prefixo. Isso também elimina a `key` manual e o risco de colisão.
3. **Erros tipados em um ponto só.** O interceptor de resposta do `httpClient` converte `AxiosError` em erros da aplicação. O `QueryProvider` e os componentes deixam de importar axios, e um helper mapeia erro para chave do i18n.
4. **Um endereço para regra de negócio, criado sob demanda.** Função pura em `src/domain/<modulo>/`, só quando a regra existir. Sem Use Case de repasse e sem container.
5. **Testes.** Vitest, começando pelas funções do item 4 e pelos schemas do item 1, que rodam sem React.

Um ajuste que não vem da B, mas é o que justifica usar Next.js: permitir que uma página de servidor chame o service para fazer prefetch e hidrate o cache do TanStack Query. Vale quando o projeto tiver página pública ou sensível a tempo de carregamento.

O que **não** trazer para um projeto web comum: boot em fases, container e wiring, signals e coordinators, Repositories locais, Services de longa duração e a proibição de dados em Server Components.

Se o projeto cair em alguma linha "B" da tabela anterior, adote a B inteira em vez de misturar. Meia adoção (Use Cases sem container, ViewModels em algumas telas) soma o custo das duas e não entrega a previsibilidade de nenhuma.

## Limites desta comparação

- A análise veio da leitura dos documentos e do código de exemplo das duas, mais a estrutura do barlav. Nenhuma foi medida em um projeto real: tamanho de bundle e tempo de renderização são consequências esperadas da estrutura, não números coletados.
- A contagem de arquivos considera uma listagem simples. Em funcionalidade com regra de negócio real, a diferença diminui.
