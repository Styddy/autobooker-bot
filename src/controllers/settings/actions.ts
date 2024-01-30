import { AutobookerContext } from "telegraf";
import {
  getInlineBackKeyboard,
  getLanguageKeyboard,
  getSettingsMainKeyboard,
} from "./helpers";
import logger from "../../util/logger";
import { updateLanguage } from "../../util/language";
import { getBackKeyboard } from "../../util/keyboards";
import { callbackQuery, message } from "telegraf/filters";
import {
  deleteButtons,
  sendMessageToBeDeletedLater,
  sleep,
} from "../../util/common";
import { updateMail } from "../../util/mail";
import { updatePassword } from "../../util/password";

export const languageSettingsAction = async (ctx: AutobookerContext) =>
  await ctx.editMessageText(
    ctx.i18n.t("scenes.settings.pick_language"),
    getLanguageKeyboard(ctx)
  );

export const languageChangeAction = async (ctx: AutobookerContext) => {
  if (ctx.has(callbackQuery("data"))) {
    const langData = JSON.parse(ctx.callbackQuery.data);
    await updateLanguage(ctx, langData.p);
    const { backKeyboard } = getBackKeyboard(ctx);
    if ("text" in ctx.callbackQuery.message)
      await ctx.editMessageText(
        ctx.callbackQuery.message.text + "\n\nChoosen: English"
      );
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.settings.language_changed"),
      "settingsScene",
      getSettingsMainKeyboard(ctx)
    );
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.settings.what_to_change"),
      "settingsScene",
      backKeyboard
    );
  }
};

export const mailSettingsAction = async (ctx: AutobookerContext) => {
  await ctx.editMessageReplyMarkup(undefined);
  await sendMessageToBeDeletedLater(
    ctx,
    ctx.i18n.t("scenes.settings.insert_mail", {
      mail: ctx.session.user.mail,
      password: ctx.session.user.password,
    }),
    "settingsScene",
    getInlineBackKeyboard(ctx, "back")
  );
  ctx.session.settingsScene.subscene = "mail";
};

export const passwordSettingsAction = async (ctx: AutobookerContext) => {
  await ctx.editMessageReplyMarkup(undefined);
  await sendMessageToBeDeletedLater(
    ctx,
    ctx.i18n.t("scenes.settings.insert_password", {
      mail: ctx.session.user.mail,
      password: ctx.session.user.password,
    }),
    "settingsScene",
    getInlineBackKeyboard(ctx, "back")
  );
  ctx.session.settingsScene.subscene = "password";
};

export const mailChangeAction = async (ctx: AutobookerContext) => {
  await deleteButtons(ctx, "settingsScene");
  if (
    ctx.has(message("text")) &&
    ctx.message.text &&
    /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@it-present.com$/.test(ctx.message.text)
  ) {
    await updateMail(ctx, ctx.message.text);
    await sleep(3);
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.settings.language_changed"),
      "settingsScene",
      getSettingsMainKeyboard(ctx)
    );
    ctx.session.settingsScene.subscene = "";
  } else {
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.start.wrong_mail", {
        mail: ctx.session.user.mail,
        password: ctx.session.user.password,
      }),
      "settingsScene",
      getInlineBackKeyboard(ctx, "back")
    );
  }
};

export const passwordChangeAction = async (ctx: AutobookerContext) => {
  await deleteButtons(ctx, "settingsScene");
  if (assertSubscene(ctx, "password") && ctx.has(message("text"))) {
    updatePassword(ctx, ctx.message.text);
    await sleep(3);
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.settings.language_changed"),
      "settingsScene",
      getSettingsMainKeyboard(ctx)
    );
    ctx.session.settingsScene.subscene = "";
  }
};

export const backAction = async (ctx: AutobookerContext) => {
  await ctx.editMessageReplyMarkup(undefined);
  await sendMessageToBeDeletedLater(
    ctx,
    ctx.i18n.t("scenes.settings.what_to_change"),
    "settingsScene",
    getSettingsMainKeyboard(ctx)
  );
  await ctx.answerCbQuery();
  ctx.session.settingsScene.subscene = "";
};

export const accountSummaryAction = async (ctx: AutobookerContext) => {
  logger.debug(ctx, "Checking account summary");
  const user = ctx.session.user;

  await ctx.editMessageText(
    ctx.i18n.t("scenes.settings.account_summary", {
      username: user.username,
      mail: user.mail,
      password: user.password,
      id: user._id,
      version: process.env.npm_package_version,
    }),
    getInlineBackKeyboard(ctx, "back")
  );
  await ctx.answerCbQuery();
};

export const redirectAction = async (ctx: AutobookerContext) => {
  if (assertSubscene(ctx, "mail")) {
    await mailChangeAction(ctx);
  } else if (assertSubscene(ctx, "password")) {
    await passwordChangeAction(ctx);
  }
};

export const assertSubscene = (
  ctx: AutobookerContext,
  subscene: "mail" | "password" | "confirm"
) => {
  return ctx.session.settingsScene.subscene === subscene;
};
