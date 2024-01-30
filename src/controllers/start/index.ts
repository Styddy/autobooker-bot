import { AutobookerContext, Scenes } from "telegraf";
import {
  backLanguageAction,
  backMailAction,
  backPasswordAction,
  confirmAction,
  languageChangeAction,
  redirectAction,
  startAction,
} from "./actions";
import { message } from "telegraf/filters";
import logger from "../../util/logger";
import { deleteButtons } from "../../util/common";
import { getMainKeyboard } from "../../util/keyboards";
import { deleteFromSession } from "../../util/session";

const start = new Scenes.BaseScene<AutobookerContext>("start");

start.enter(startAction);
start.leave(async (ctx: AutobookerContext) => {
  logger.debug(ctx, "Leaves start scene");
  await deleteButtons(ctx, "startScene");

  await ctx.reply(
    ctx.i18n.t("shared.what_next"),
    getMainKeyboard(ctx).mainKeyboard
  );
  deleteFromSession(ctx, "startScene");
});
start.command("saveme", (ctx: AutobookerContext) => {
  ctx.scene.leave();
  ctx.scene.enter("start");
});
start.action(/languageChange/, languageChangeAction);
start.action(/backLanguage/, backLanguageAction);
start.action(/backMail/, backMailAction);
start.action(/backPassword/, backPasswordAction);
start.action(/confirm/, confirmAction);
start.on(message("text"), redirectAction);

export default start;
