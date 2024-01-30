export * from "telegraf-i18n";

declare module "telegraf-i18n" {
  interface I18n extends TelegrafI18n {
    locale(languageCode: string): void;
  }

  export function match(resourceKey: string, templateData?: unknown): string;
}
