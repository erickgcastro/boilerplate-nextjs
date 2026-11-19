# Módulos de domínio

Cada domínio de negócio fica em `src/domain/<modulo>/`, sempre com as mesmas três pastas. As chamadas HTTP de todos os domínios ficam juntas em `src/repository/`. Os exemplos abaixo usam um módulo `product`:

```
src/domain/product/
├── entities/product.ts            # formato do dado que a API devolve
├── dto/create-product.dto.ts      # schema zod e tipo do que é enviado
├── dto/update-product.dto.ts
├── hooks/product.queries.ts       # hooks do React Query
└── hooks/index.ts                 # reexporta os hooks

src/repository/
├── product.service.ts             # chamadas HTTP do recurso
└── index.ts                       # registro de todos os services
```

## entities

Interfaces TypeScript com o formato da resposta da API. Sem lógica.

```ts
export interface Product {
  id: number;
  name: string;
  price: number;
}
```

## dto

Um arquivo por operação de escrita, com um schema zod e o tipo inferido dele, para a validação e o tipo nunca divergirem.

```ts
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
```

## repository (services)

`src/repository/` concentra todo o HTTP do projeto: um arquivo `<recurso>.service.ts` por recurso da API, e nenhuma outra pasta importa o `httpClient`.

O service estende `Service` de `@/services` e define dois campos estáticos:

- `key`: prefixo das query keys do React Query. Precisa ser único entre todos os services.
- `defaultPath`: caminho base do recurso na API.

Cada método escolhe um `HttpMethods`, monta o caminho com `Service.endpoint(defaultPath, sufixo)`, chama `httpClient[method]` e declara o tipo de retorno:

```ts
import { httpClient } from "@/config/axios-client";
import type { CreateProductDto } from "@/domain/product/dto/create-product.dto";
import type { Product } from "@/domain/product/entities/product";
import { HttpMethods, Service } from "@/services";

export class ProductService extends Service {
  public static key = "@product";
  public static defaultPath = "/products";

  public static async getAllProducts(): Promise<Product[]> {
    const method = HttpMethods.GET;
    const path = Service.endpoint(ProductService.defaultPath, "");
    const { data } = await httpClient[method](path);
    return data;
  }

  public static async createProduct(dto: CreateProductDto): Promise<Product> {
    const method = HttpMethods.POST;
    const path = Service.endpoint(ProductService.defaultPath, "");
    const { data } = await httpClient[method](path, dto);
    return data;
  }
}
```

Para enviar multipart, use `Service.toFormData(obj)`. Ele expande `FileList` em vários campos e serializa a chave `utm` como JSON.

`src/repository/index.ts` exporta uma classe `Service` que registra todos os services do projeto:

```ts
import { OrderService } from "./order.service";
import { ProductService } from "./product.service";

export class Service {
  static order = OrderService;
  static product = ProductService;
}
```

Ela tem o mesmo nome da classe base de `@/services`. Nos hooks, `Service` é sempre esse registro, importado de `@/repository`.

## hooks

- Um hook por método do service, agrupados num objeto `<Modulo>Queries`.
- A query key sai do helper `Key`: `[Key(Service.product, "getAllProducts")]` vira `"@product:getAllProducts"`. Parâmetros entram depois: `[Key(Service.product, "getProductById"), id]`.
- Query que depende de parâmetro usa `enabled: !!id`.
- Toda mutation invalida as queries afetadas no `onSuccess`.
- O arquivo começa com `"use client"`.

```ts
"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Service } from "@/repository";
import { Key } from "@/services";

function useGetAllProducts() {
  return useQuery({
    queryKey: [Key(Service.product, "getAllProducts")],
    queryFn: Service.product.getAllProducts,
  });
}

function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [Key(Service.product, "createProduct")],
    mutationFn: Service.product.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Key(Service.product, "getAllProducts")],
      });
    },
  });
}

export const ProductQueries = { useGetAllProducts, useCreateProduct };
```

Nos componentes:

```tsx
import { ProductQueries } from "@/domain/product/hooks";

const { data, isLoading } = ProductQueries.useGetAllProducts();
```

## Configuração global

- `src/config/axios-client.ts` exporta o `httpClient`. A URL base vem de `NEXT_PUBLIC_API_URL`, e o interceptor de request é o lugar de anexar o token.
- `src/providers/query-provider.tsx` cria o `QueryClient` e concentra as opções padrão e o tratamento de erros globais.

## Criando um módulo novo

1. `src/domain/<modulo>/entities/<modulo>.ts` com a interface da resposta.
2. Um DTO por operação de escrita em `dto/`.
3. `src/repository/<modulo>.service.ts` estendendo `Service`, com `key` e `defaultPath` próprios.
4. Registrar o service em `src/repository/index.ts`.
5. `src/domain/<modulo>/hooks/<modulo>.queries.ts` exportando `<Modulo>Queries`, reexportado em `hooks/index.ts`.
6. Nos componentes, importar de `@/domain/<modulo>/hooks`.
