# UI e estilos

## Tailwind CSS 4

- A configuração fica toda em CSS, em `src/app/(frontend)/globals.css`. Não existe `tailwind.config`.
- O PostCSS usa `@tailwindcss/postcss`, e `tw-animate-css` fornece as animações.
- Os tokens de tema (paleta neutral do shadcn, em oklch) ficam em `:root` e `[data-theme="dark"]` e chegam ao Tailwind pelo bloco `@theme inline`. Isso gera classes como `bg-background`, `text-foreground`, `bg-muted`, `bg-primary` e `border-border`.
- Use os tokens em vez de cores fixas como `bg-gray-100`, para o tema escuro funcionar sem `dark:` em todo lugar. Cor nova vira token nos dois blocos e no `@theme inline`.

## Tema escuro

- `next-themes` grava `data-theme="light"` ou `data-theme="dark"` no `<html>`.
- A variante `dark:` do Tailwind está ligada a `[data-theme=dark]` pelo `@custom-variant` no `globals.css`.
- Para ler ou trocar o tema, use `useTheme()` de `next-themes`.

## Fontes

Geist e Geist Mono vêm de `next/font/google` no layout raiz e viram as variáveis `--font-geist-sans` e `--font-geist-mono`, usadas por `font-sans` e `font-mono`.

## shadcn/ui

- `components.json` define o estilo `new-york`, suporte a RSC e ícones do `lucide-react`.
- Antes de escrever um componente base (botão, input, dialog...), veja se o shadcn tem. Para adicionar: `npx shadcn@latest add <componente>`. Ele é criado em `src/components/ui/`.
- Os arquivos em `src/components/ui/` são código do projeto e podem ser editados.
- Os componentes gerados pela CLI importam `cn` do pacote `cn` e primitivas do pacote `radix-ui`. `src/lib/utils.ts` exporta um `cn` equivalente, feito com `clsx` e `tailwind-merge`.

## Componentes do projeto

- Ficam em `src/components/`, com arquivo em kebab-case e export nomeado em PascalCase: `delete-product-button.tsx` exporta `DeleteProductButton`.
- São montados sobre os componentes de `src/components/ui/`.
- Buscam dados pelos hooks do domínio e tiram todo texto do i18n.

```tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProductQueries } from "@/domain/product/hooks";

export function DeleteProductButton({ id }: { id: number }) {
  const t = useTranslations();
  const { mutateAsync, isPending } = ProductQueries.useDeleteProduct();

  const onDelete = async () => {
    try {
      await mutateAsync(id);
      alert(t("product.delete.success"));
    } catch {
      alert(t("product.delete.error"));
    }
  };

  return (
    <Button variant="destructive" disabled={isPending} onClick={onDelete}>
      {t("product.delete.label")}
    </Button>
  );
}
```
