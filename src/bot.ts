import "dotenv/config";
import path from "path";
import cron from "node-cron";
import logger from "./util/logger";
import about from "./controllers/about";
import startScene from "./controllers/start";
import bookingsScene from "./controllers/bookings";
import settingsScene from "./controllers/settings";
import contactScene from "./controllers/contact";
import adminScene from "./controllers/admin";
import TelegrafI18n, { match } from "telegraf-i18n";
import { notifyForBooking } from "./util/notifier";
import asyncWrapper from "./util/error-handler";
import { getMainKeyboard } from "./util/keyboards";
import { updateLanguage } from "./util/language";
import { updateUserTimestamp } from "./middlewares/update-user-timestamp";
import { getUserInfo } from "./middlewares/user-info";
import { isAdmin } from "./middlewares/is-admin";
import LocalSession from "telegraf-session-local";
import { AutobookerContext, Markup, Scenes, Telegraf } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { autobook } from "./util/booker";
import {
  confirmCancelBookingAction,
  confirmValidateBookingAction,
} from "./controllers/bookings/actions";

const bot = new Telegraf<AutobookerContext>(process.env.TELEGRAM_TOKEN);
export const database = new LocalSession<AutobookerContext>({
  database: "autobooker_db.json",
});
const stage = new Scenes.Stage<AutobookerContext>([
  startScene,
  bookingsScene,
  settingsScene,
  contactScene,
  adminScene,
]);
const i18n = new TelegrafI18n({
  defaultLanguage: "en",
  directory: path.resolve(__dirname, "locales"),
  useSession: true,
  allowMissing: false,
  sessionName: "session",
});

bot.use(database.middleware());
bot.use(i18n.middleware());
bot.use(stage.middleware());
bot.use(getUserInfo);

bot.command("saveme", async (ctx: AutobookerContext) => {
  logger.debug(ctx, "User uses /saveme command");
  const { mainKeyboard } = getMainKeyboard(ctx);
  await ctx.reply(ctx.i18n.t("shared.what_next"), mainKeyboard);
});
bot.start(
  asyncWrapper(async (ctx: AutobookerContext) => ctx.scene.enter("start"))
);
bot.command(
  "bookings",
  updateUserTimestamp,
  asyncWrapper(
    async (ctx: AutobookerContext) => await ctx.scene.enter("bookings")
  )
);
bot.hears(
  match("keyboards.main_keyboard.bookings"),
  updateUserTimestamp,
  asyncWrapper(
    async (ctx: AutobookerContext) => await ctx.scene.enter("bookings")
  )
);
bot.hears(
  match("keyboards.main_keyboard.settings"),
  updateUserTimestamp,
  asyncWrapper(
    async (ctx: AutobookerContext) => await ctx.scene.enter("settings")
  )
);
bot.hears(
  match("keyboards.main_keyboard.about"),
  updateUserTimestamp,
  asyncWrapper(about)
);
bot.hears(
  match("keyboards.main_keyboard.contact"),
  updateUserTimestamp,
  asyncWrapper(
    async (ctx: AutobookerContext) => await ctx.scene.enter("contact")
  )
);
bot.hears(
  match("keyboards.back_keyboard.back"),
  asyncWrapper(async (ctx: AutobookerContext) => {
    // If this method was triggered, it means that bot was updated when user was not in the main menu..
    logger.debug(ctx, "Return to the main menu with the back button");
    const { mainKeyboard } = getMainKeyboard(ctx);

    await ctx.reply(ctx.i18n.t("shared.what_next"), mainKeyboard);
  })
);

bot.hears(
  match("keyboards.main_keyboard.support"),
  asyncWrapper(async (ctx: AutobookerContext) => {
    logger.debug(ctx, "Opened support options");
    await ctx.reply(
      ctx.i18n.t("other.support"),
      Markup.inlineKeyboard([
        Markup.button.url("Paypal", process.env.PAYPAL_LINK),
        Markup.button.url("Satispay", process.env.SATISPAY_LINK),
      ])
    );
  })
);

bot.action(
  /"cancelNotify"/,
  asyncWrapper(async (ctx: AutobookerContext) => {
    if (ctx.has(callbackQuery("data"))) {
      const data = JSON.parse(ctx.callbackQuery.data);
      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard([
          Markup.button.callback(
            ctx.i18n.t("keyboards.back_keyboard.back"),
            JSON.stringify({ a: "backCancelNotify", p: data.p })
          ),
          Markup.button.callback(
            ctx.i18n.t("scenes.bookings.confirm"),
            JSON.stringify({ a: "confirmCancelNotify", p: data.p })
          ),
        ]).reply_markup
      );
      await ctx.answerCbQuery();
    }
  })
);

bot.action(
  /"validateNotify"/,
  asyncWrapper(async (ctx: AutobookerContext) => {
    if (ctx.has(callbackQuery("data"))) {
      const data = JSON.parse(ctx.callbackQuery.data);
      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard([
          Markup.button.callback(
            ctx.i18n.t("keyboards.back_keyboard.back"),
            JSON.stringify({ a: "backValidateNotify", p: data.p })
          ),
          Markup.button.callback(
            ctx.i18n.t("scenes.bookings.confirm"),
            JSON.stringify({ a: "confirmValidateNotify", p: data.p })
          ),
        ]).reply_markup
      );
      await ctx.answerCbQuery();
    }
  })
);

bot.action(
  /"backCancelNotify"/,
  asyncWrapper(async (ctx: AutobookerContext) => {
    if (ctx.has(callbackQuery("data"))) {
      const data = JSON.parse(ctx.callbackQuery.data);

      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard([
          Markup.button.callback(
            ctx.i18n.t("scenes.bookings.cancel"),
            JSON.stringify({ a: "cancelNotify", p: data.p })
          ),
        ]).reply_markup
      );
      await ctx.answerCbQuery();
    }
  })
);

bot.action(
  /"backValidateNotify"/,
  asyncWrapper(async (ctx: AutobookerContext) => {
    if (ctx.has(callbackQuery("data"))) {
      const data = JSON.parse(ctx.callbackQuery.data);

      await ctx.editMessageReplyMarkup(
        Markup.inlineKeyboard([
          Markup.button.callback(
            ctx.i18n.t("scenes.bookings.validate"),
            JSON.stringify({ a: "validateNotify", p: data.p })
          ),
        ]).reply_markup
      );
      await ctx.answerCbQuery();
    }
  })
);

bot.action(/"confirmCancelNotify"/, asyncWrapper(confirmCancelBookingAction));

bot.action(
  /"confirmValidateNotify"/,
  asyncWrapper(confirmValidateBookingAction)
);

bot.hears(
  /(.*admin)/,
  isAdmin,
  asyncWrapper(async (ctx: AutobookerContext) => await ctx.scene.enter("admin"))
);

bot.hears(/(.*?)/, async (ctx) => {
  logger.debug(ctx, "Default handler has fired");
  const user = ctx.session.user;
  await updateLanguage(ctx, user.language);

  const { mainKeyboard } = getMainKeyboard(ctx);
  await ctx.reply(ctx.i18n.t("other.default_handler"), mainKeyboard);
});

bot.catch((error: unknown) => {
  logger.error(undefined, "Global error has happened, %O", error);
});

cron.schedule("0 21 * * *", function () {
  notifyForBooking(database.DB, i18n, 1);
});

cron.schedule("59 23 * * *", function () {
  autobook(database.DB, i18n);
});

cron.schedule("0 8 * * *", function () {
  notifyForBooking(database.DB, i18n, 0);
});

process.env.NODE_ENV === "production" ? startProdMode(bot) : startDevMode(bot);

function startDevMode(bot: Telegraf<AutobookerContext>) {
  logger.debug(undefined, "Starting a bot in development mode");
  bot.launch();
}

function startProdMode(bot: Telegraf<AutobookerContext>) {
  logger.debug(undefined, "Starting a bot in production mode");
  bot.launch();
}
