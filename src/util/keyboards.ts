import { Markup, AutobookerContext } from "telegraf";

/**
 * Returns back keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
export const getBackKeyboard = (ctx: AutobookerContext) => {
  const backKeyboardBack = ctx.i18n.t("keyboards.back_keyboard.back");
  let backKeyboard = Markup.keyboard([backKeyboardBack]);
  backKeyboard = backKeyboard.resize();

  return {
    backKeyboard,
    backKeyboardBack,
  };
};

/**
 * Returns main keyboard and its buttons according to the language
 * @param ctx - telegram context
 */
export const getMainKeyboard = (ctx: AutobookerContext) => {
  const mainKeyboardBookings = ctx.i18n.t("keyboards.main_keyboard.bookings");
  const mainKeyboardSettings = ctx.i18n.t("keyboards.main_keyboard.settings");
  const mainKeyboardAbout = ctx.i18n.t("keyboards.main_keyboard.about");
  const mainKeyboardSupport = ctx.i18n.t("keyboards.main_keyboard.support");
  const mainKeyboardContact = ctx.i18n.t("keyboards.main_keyboard.contact");

  const mainKeyboard = Markup.keyboard([
    [mainKeyboardBookings],
    [mainKeyboardSettings, mainKeyboardSupport],
  ]).resize();

  return {
    mainKeyboard,
    mainKeyboardBookings,
    mainKeyboardSettings,
    mainKeyboardAbout,
    mainKeyboardSupport,
    mainKeyboardContact,
  };
};
