import { AutobookerContext, Markup } from "telegraf";
import { callbackQuery } from "telegraf/filters";

/**
 * Returns bookings keyboard
 */
export function getBookingsKeyboard(ctx: AutobookerContext) {
  return Markup.keyboard([
    Markup.button.text(ctx.i18n.t("keyboards.back_keyboard.back")),
    Markup.button.text(ctx.i18n.t("scenes.bookings.refresh")),
  ])
    .oneTime()
    .resize();
}

export const getBookingKeyboard = (ctx: AutobookerContext, data: string) =>
  Markup.inlineKeyboard([
    Markup.button.callback(
      ctx.i18n.t("scenes.bookings.cancel"),
      JSON.stringify({ a: "cancel", p: data })
    ),
  ]);

export function getConfirmCancelKeyboard(ctx: AutobookerContext) {
  if (ctx.has(callbackQuery("data"))) {
    const data = JSON.parse(ctx.callbackQuery.data);
    return Markup.inlineKeyboard([
      Markup.button.callback(
        ctx.i18n.t("keyboards.back_keyboard.back"),
        JSON.stringify({ a: "backCancel", p: data.p })
      ),
      Markup.button.callback(
        ctx.i18n.t("scenes.bookings.confirm"),
        JSON.stringify({ a: "confirmCancel", p: data.p })
      ),
    ]).reply_markup;
  }
}
