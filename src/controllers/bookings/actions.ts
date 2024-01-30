import { AutobookerContext } from "telegraf";
import {
  getBookingKeyboard,
  getBookingsKeyboard,
  getConfirmCancelKeyboard,
} from "./helpers";
import {
  annullaPrenotazione,
  convalidaPrenotazione,
  getPrenotazioni,
  login,
} from "../../util/booking";
import { IResponse } from "../../models/Response";
import { IReservation } from "../../models/Reservation";
import {
  deleteButtons,
  sendMessageToBeDeletedLater,
  sleep,
} from "../../util/common";
import { callbackQuery } from "telegraf/filters";
import { format } from "date-fns";

async function manageLogin(ctx: AutobookerContext) {
  const loginResponse: {
    response: IResponse;
    sessionId: string;
  } = await login(ctx.session.user.mail, ctx.session.user.password);
  let error = false;
  if (
    loginResponse.response.error &&
    typeof loginResponse.response.error !== "boolean"
  ) {
    error = true;
    ctx.reply(
      ctx.i18n.t("scenes.bookings.login_error", {
        error: loginResponse.response.error.message,
      })
    );
  }
  return { loginResponse, error };
}

async function managePrenotazioni(ctx: AutobookerContext) {
  const login = await manageLogin(ctx);
  if (!login.error) {
    const bookings: IResponse = await getPrenotazioni(
      login.loginResponse.sessionId,
      31
    );
    if (!bookings.error && bookings.response instanceof Array) {
      const response = bookings.response as IReservation[];
      const nextFive: IReservation[] = response
        .sort((a: IReservation, b: IReservation) =>
          a.time_start > b.time_start ? 1 : -1
        )
        .slice(0, 5)
        .map((x: IReservation) => {
          const timeStart = new Date(x.time_start);
          const timeEnd = new Date(x.time_end);
          x.time_start = format(timeStart, "yyyy-MM-dd hh:mm");
          x.time_end = format(timeEnd, "yyyy-MM-dd hh:mm");
          return x;
        });
      for (const x of nextFive) {
        await sendMessageToBeDeletedLater(
          ctx,
          ctx.i18n.t("scenes.bookings.booking_text", x),
          "bookingsScene",
          getBookingKeyboard(ctx, x.id)
        );
        await sleep(0.3);
      }
      if (nextFive.length === 0) {
        await ctx.reply(
          ctx.i18n.t("scenes.bookings.empty"),
          getBookingsKeyboard(ctx)
        );
      }
    }
  }
}

export const bookingsEnterAction = async (ctx: AutobookerContext) => {
  await deleteButtons(ctx, "bookingsScene");
  await ctx.replyWithMarkdownV2(
    `*${ctx.i18n.t("scenes.bookings.enter")}*`,
    getBookingsKeyboard(ctx)
  );
  await managePrenotazioni(ctx);
};

export const confirmValidateBookingAction = async (ctx: AutobookerContext) => {
  confirmBookingAction(ctx, true);
};

export const confirmCancelBookingAction = async (ctx: AutobookerContext) => {
  confirmBookingAction(ctx, false);
};

const confirmBookingAction = async (
  ctx: AutobookerContext,
  validate: boolean
) => {
  const loginResponse: {
    response: IResponse;
    sessionId: string;
  } = await login(ctx.session.user.mail, ctx.session.user.password);

  if (
    loginResponse.response.error &&
    typeof loginResponse.response.error !== "boolean"
  ) {
    ctx.reply(
      ctx.i18n.t("scenes.bookings.login_error", {
        error: loginResponse.response.error.message,
      })
    );
  } else if (loginResponse && ctx.has(callbackQuery("data"))) {
    const data = JSON.parse(ctx.callbackQuery.data);
    const bookings: IResponse = validate
      ? await convalidaPrenotazione(loginResponse.sessionId, data.p)
      : await annullaPrenotazione(loginResponse.sessionId, data.p);
    if (bookings.error && typeof bookings.error !== "boolean") {
      await ctx.reply(
        ctx.i18n.t("scenes.bookings.booking_error", {
          error: bookings.error.message,
        })
      );
    } else if (
      bookings.response instanceof Array &&
      bookings.response.length === 0 &&
      "text" in ctx.callbackQuery.message
    ) {
      ctx.editMessageText(
        `${ctx.callbackQuery.message.text} \n${ctx.i18n.t(
          validate
            ? "scenes.bookings.booking_not_validated"
            : "scenes.bookings.booking_not_deleted"
        )}`
      );
    } else if ("text" in ctx.callbackQuery.message) {
      await ctx.editMessageText(
        `${ctx.callbackQuery.message.text}\n${ctx.i18n.t(
          validate
            ? "scenes.bookings.booking_validated"
            : "scenes.bookings.booking_deleted"
        )}`
      );
    }
  }
};

export const cancelBookingAction = async (ctx: AutobookerContext) => {
  await ctx.editMessageReplyMarkup(getConfirmCancelKeyboard(ctx));
  await ctx.answerCbQuery();
};

export const backCancelBookingAction = async (ctx: AutobookerContext) => {
  await ctx.editMessageReplyMarkup(
    getBookingKeyboard(ctx, undefined).reply_markup
  );
  await ctx.answerCbQuery();
};
