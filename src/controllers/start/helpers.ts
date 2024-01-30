import { AutobookerContext, Markup } from "telegraf";

export function getLanguageKeyboard() {
  return Markup.inlineKeyboard([
    Markup.button.callback(
      "English",
      JSON.stringify({ a: "languageChange", p: "en" })
    ),
  ]);
}

export function getBackKeyboard(ctx: AutobookerContext, action: string) {
  return Markup.inlineKeyboard([
    Markup.button.callback(ctx.i18n.t("keyboards.back_keyboard.back"), action),
  ]);
}

/**
 * Returns button that user has to click to start working with the bot
 */
export function getConfirmKeyboard(
  ctx: AutobookerContext,
  action1: string,
  action2: string
) {
  return Markup.inlineKeyboard([
    Markup.button.callback(ctx.i18n.t("keyboards.back_keyboard.back"), action1),
    Markup.button.callback(ctx.i18n.t("scenes.start.lets_go"), action2),
  ]);
}
