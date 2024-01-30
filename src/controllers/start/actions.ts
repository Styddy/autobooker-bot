import { AutobookerContext } from "telegraf";
import { callbackQuery, message } from "telegraf/filters";
import {
  deleteButtons,
  sendMessageToBeDeletedLater,
  sleep,
} from "../../util/common";
import { updateLanguage } from "../../util/language";
import {
  getBackKeyboard,
  getConfirmKeyboard,
  getLanguageKeyboard,
} from "./helpers";
import { updateMail } from "../../util/mail";
import { updateConfirmation, updatePassword } from "../../util/password";
import { saveToSession } from "../../util/session";
import logger from "../../util/logger";
import { IUser } from "../../models/User";
import { getMainKeyboard } from "../../util/keyboards";

export const startAction = async (ctx: AutobookerContext) => {
  const uid = String(ctx.from.id);
  const user = ctx.session.user;

  if (user && user.confirmed) {
    await ctx.reply(
      ctx.i18n.t("scenes.start.welcome_back"),
      getMainKeyboard(ctx).mainKeyboard
    );
  } else {
    logger.debug(ctx, "New user has been created");
    const now = new Date().getTime();

    const newUser: IUser = {
      _id: uid,
      created: now,
      username: ctx.from.username,
      name: ctx.from.first_name + " " + ctx.from.last_name,
      mail: null,
      password: null,
      parking: null,
      lastActivity: now,
      language: "en",
      confirmed: false,
    };
    saveToSession(ctx, "user", newUser);
    const subscene = "language";
    saveToSession(ctx, "startScene", {
      subscene,
    });
    await ctx.reply("Choose language", getLanguageKeyboard());
  }
};

export const languageChangeAction = async (ctx: AutobookerContext) => {
  if (ctx.has(callbackQuery("data"))) {
    await deleteButtons(ctx, "startScene");
    const langData = JSON.parse(ctx.callbackQuery.data);
    await updateLanguage(ctx, langData.p);
    await sleep(3);
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      // @ts-expect-error ts(2339) for library lazy property initialization
      ctx.callbackQuery.message.text + "\n\nChoosen: English"
    );
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.start.insert_mail", {
        mail: ctx.session.user.mail,
        password: ctx.session.user.password,
      }),
      "startScene",
      getBackKeyboard(ctx, "backLanguage")
    );
    ctx.session.startScene.subscene = "mail";
  }
};

export const backLanguageAction = async (ctx: AutobookerContext) => {
  await ctx.editMessageReplyMarkup(undefined);
  await startAction(ctx);
  ctx.session.startScene.subscene = "start";
};

export const backMailAction = async (ctx: AutobookerContext) => {
  await ctx.editMessageText(
    ctx.i18n.t("scenes.start.insert_mail", {
      mail: ctx.session.user.mail,
      password: ctx.session.user.password,
    }),
    getBackKeyboard(ctx, "backLanguage")
  );

  ctx.session.startScene.subscene = "mail";
};

export const backPasswordAction = async (ctx: AutobookerContext) => {
  await ctx.editMessageText(
    ctx.i18n.t("scenes.start.insert_password", {
      mail: ctx.session.user.mail,
      password: ctx.session.user.password,
    }),
    getBackKeyboard(ctx, "backMail")
  );

  ctx.session.startScene.subscene = "password";
};

export const redirectAction = async (ctx: AutobookerContext) => {
  if (assertSubscene(ctx, "mail")) {
    await mailChangeAction(ctx);
  } else if (assertSubscene(ctx, "password")) {
    await passwordChangeAction(ctx);
  }
};

export const mailChangeAction = async (ctx: AutobookerContext) => {
  await deleteButtons(ctx, "startScene");
  if (
    ctx.has(message("text")) &&
    ctx.message.text &&
    /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@it-present.com$/.test(ctx.message.text)
  ) {
    await updateMail(ctx, ctx.message.text);
    await sleep(3);
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.start.insert_password"),
      "startScene",
      getBackKeyboard(ctx, "backMail")
    );
    ctx.session.startScene.subscene = "password";
  } else {
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.start.wrong_mail", {
        mail: ctx.session.user.mail,
        password: ctx.session.user.password,
      }),
      "startScene",
      getBackKeyboard(ctx, "backLanguage")
    );
  }
};

export const passwordChangeAction = async (ctx: AutobookerContext) => {
  await deleteButtons(ctx, "startScene");
  if (assertSubscene(ctx, "password") && ctx.has(message("text"))) {
    updatePassword(ctx, ctx.message.text);
    await sleep(3);
    await sendMessageToBeDeletedLater(
      ctx,
      ctx.i18n.t("scenes.start.confirm_message", {
        mail: ctx.session.user.mail,
        password: ctx.session.user.password,
      }),
      "startScene",
      getConfirmKeyboard(ctx, "backPassword", "confirm")
    );
    ctx.session.startScene.subscene = "confirm";
  }
};

export const confirmAction = async (ctx: AutobookerContext) => {
  updateConfirmation(ctx, true);
  ctx.answerCbQuery();
  ctx.scene.leave();
};

export const assertSubscene = (
  ctx: AutobookerContext,
  subscene: "mail" | "password" | "confirm"
) => {
  return ctx.session.startScene.subscene === subscene;
};
