import { Markup, AutobookerContext } from "telegraf";

/**
 * Returns main settings keyboard
 */
export function getSettingsMainKeyboard(ctx: AutobookerContext) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        ctx.i18n.t("scenes.settings.language_button"),
        JSON.stringify({ a: "languageSettings" })
      ),
    ],
    [
      Markup.button.callback(
        ctx.i18n.t("scenes.settings.mail_button"),
        JSON.stringify({ a: "mailSettings" })
      ),
    ],
    [
      Markup.button.callback(
        ctx.i18n.t("scenes.settings.password_button"),
        JSON.stringify({ a: "passwordSettings" })
      ),
    ],
    [
      Markup.button.callback(
        ctx.i18n.t("scenes.settings.account_summary_button"),
        JSON.stringify({ a: "accountSummary" })
      ),
    ],
  ]);
}

/**
 * Returns language keyboard
 */
export function getLanguageKeyboard(ctx: AutobookerContext) {
  return Markup.inlineKeyboard([
    Markup.button.callback(
      ctx.i18n.t("scenes.settings.back_button"),
      JSON.stringify({ a: "back" })
    ),
    Markup.button.callback(
      "🇬🇧 English",
      JSON.stringify({ a: "languageChange", p: "en" })
    ),
  ]);
}

export function getInlineBackKeyboard(ctx: AutobookerContext, action: string) {
  return Markup.inlineKeyboard([
    Markup.button.callback(ctx.i18n.t("keyboards.back_keyboard.back"), action),
  ]);
}

/**
 * Send message and saving it to the session. Later it can be deleted.
 * Used to avoid messages duplication
 * @param ctx - telegram context
 * @param translationKey - translation key
 * @param extra - extra for the message, e.g. keyboard
 */
