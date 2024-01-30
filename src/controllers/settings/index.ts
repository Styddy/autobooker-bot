import { AutobookerContext, Scenes } from "telegraf";
import { match } from "telegraf-i18n";
import { getSettingsMainKeyboard } from "./helpers";
import {
  languageSettingsAction,
  languageChangeAction,
  accountSummaryAction,
  mailSettingsAction,
  passwordSettingsAction,
  redirectAction,
  backAction,
} from "./actions";
import { getMainKeyboard, getBackKeyboard } from "../../util/keyboards";
import { deleteFromSession, saveToSession } from "../../util/session";
import logger from "../../util/logger";
import { deleteButtons, sendMessageToBeDeletedLater } from "../../util/common";
import { message } from "telegraf/filters";

const { leave } = Scenes.Stage;
const settings = new Scenes.BaseScene<AutobookerContext>("settings");

settings.enter(async (ctx: AutobookerContext) => {
  logger.debug(ctx, "Enters settings scene");
  const { backKeyboard } = getBackKeyboard(ctx);

  deleteFromSession(ctx, "settingsScene");
  const subscene = "";
  saveToSession(ctx, "settingsScene", {
    subscene,
  });
  await ctx.reply(ctx.i18n.t("scenes.settings.settings"), backKeyboard);
  await sendMessageToBeDeletedLater(
    ctx,
    ctx.i18n.t("scenes.settings.what_to_change"),
    "settingsScene",
    getSettingsMainKeyboard(ctx)
  );
});

settings.leave(async (ctx: AutobookerContext) => {
  logger.debug(ctx, "Leaves settings scene");
  await deleteButtons(ctx, "settingsScene");
  await ctx.reply(
    ctx.i18n.t("shared.what_next"),
    getMainKeyboard(ctx).mainKeyboard
  );
  deleteFromSession(ctx, "settingsScene");
});

settings.command("saveme", leave());
settings.hears(match("keyboards.back_keyboard.back"), leave());

settings.action(/languageSettings/, languageSettingsAction);
settings.action(/languageChange/, languageChangeAction);
settings.action(/mailSettings/, mailSettingsAction);
settings.action(/back/, backAction);
settings.action(/passwordSettings/, passwordSettingsAction);
settings.action(/accountSummary/, accountSummaryAction);
settings.on(message("text"), redirectAction);

export default settings;
