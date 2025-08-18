import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = await import(
    `../../public/locales/${locale}/messages.json`
  ).then((module) => module.default);

  const erros = await import(`../../public/locales/${locale}/errors.json`).then(
    (module) => module.default,
  );

  return {
    locale,
    messages: {
      ...messages,
      ...erros,
    },
  };
});
