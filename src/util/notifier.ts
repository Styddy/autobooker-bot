/* eslint-disable @typescript-eslint/no-explicit-any */
import logger from "./logger";
import { sleep } from "./common";
import { IUser } from "../models/User";
import telegram from "../telegram";
import { Markup } from "telegraf";
import { IResponse } from "../models/Response";
import { getPrenotazioni, login } from "./booking";
import { IReservation } from "../models/Reservation";
import TelegrafI18n from "telegraf-i18n";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { format } from "date-fns";

export async function notifyForBooking(
  database: any,
  i18n: TelegrafI18n,
  deltaDay: number
) {
  logger.debug(undefined, "Starting to notify for tomorrow bookings");
  const checkedUsers: IUser[] = [];
  const toDeleteUsers: any[] = [];
  const sessions = database.getState().sessions;

  sessions.forEach((session: any) => {
    if (!session.data.user.username) {
      toDeleteUsers.push(session);
    } else if (session.data.user.confirmed) {
      checkedUsers.push(session.data.user);
    }
  });
  toDeleteUsers.forEach((session: any) =>
    database.get("sessions").removeById(session.id).write()
  );
  await notifyAndUpdateUsers(checkedUsers, i18n, deltaDay);
}

async function manageLogin(user: IUser, i18n: TelegrafI18n) {
  const loginResponse: {
    response: IResponse;
    sessionId: string;
  } = await login(user.mail, user.password);
  let message = undefined;
  let error = false;
  if (
    loginResponse.response.error &&
    typeof loginResponse.response.error !== "boolean"
  ) {
    error = true;
    message = i18n.t(user.language, "notifier.credentials_not_valid");
  }
  return { loginResponse, error, message };
}

async function managePrenotazioni(
  user: IUser,
  i18n: TelegrafI18n,
  deltaDay: number
) {
  const login = await manageLogin(user, i18n);
  let message = login.message;
  let booking: IReservation = undefined;
  if (!login.error) {
    const bookings: IResponse = await getPrenotazioni(
      login.loginResponse.sessionId,
      1
    );
    if (!bookings.error && bookings.response instanceof Array) {
      const date = new Date();
      date.setDate(date.getDate() + deltaDay);
      booking = bookings.response
        .filter((b: IReservation) => {
          const timeStart = new Date(b.time_start);
          return compareDates(timeStart, date);
        })
        .map((x: IReservation) => x)
        .shift();
      if (booking) message = booking.id;
    }
  }
  return { booking: booking, message };
}

function compareDates(a: Date, b: Date) {
  return format(a, "yyyyMMdd") === format(b, "yyyyMMdd");
}

async function notifyAndUpdateUsers(
  users: IUser[],
  i18n: TelegrafI18n,
  deltaDay: number
) {
  const usersBookingPromises: Promise<void>[] = [];
  for (const user of users) {
    usersBookingPromises.push(notifyAndUpdateUser(user, i18n, deltaDay));
  }
  await Promise.all(usersBookingPromises);
}

async function notifyAndUpdateUser(
  user: IUser,
  i18n: TelegrafI18n,
  deltaDay: number
) {
  //Check if the user have a booking for tomorrow
  logger.debug(undefined, `Notifying user ${user.username} about next booking`);
  const prenotazione = await managePrenotazioni(user, i18n, deltaDay);
  if (prenotazione.booking) {
    sendMessage(
      user._id,
      i18n.t(
        user.language,
        "scenes.bookings.booking_text",
        prenotazione.booking
      ),
      prenotazione.booking
        ? bookingKeyboard(user, i18n, prenotazione.booking.id, deltaDay)
        : null
    );
  } else if (prenotazione.message) {
    sendMessage(user._id, prenotazione.message, null);
  }
  await sleep(0.5);
}

function bookingKeyboard(
  user: IUser,
  i18n: TelegrafI18n,
  id: string,
  deltaDay: number
) {
  if (deltaDay === 0) {
    return Markup.inlineKeyboard([
      Markup.button.callback(
        i18n.t(user.language, "scenes.bookings.validate"),
        JSON.stringify({
          a: "validateNotify",
          p: id,
        })
      ),
    ]);
  } else {
    return Markup.inlineKeyboard([
      Markup.button.callback(
        i18n.t(user.language, "scenes.bookings.cancel"),
        JSON.stringify({
          a: "cancelNotify",
          p: id,
        })
      ),
    ]);
  }
}

export async function sendMessage(
  chatId: string | number,
  text: string,
  extra?: ExtraReplyMessage
) {
  try {
    await telegram.sendMessage(chatId, text, extra);
  } catch (e) {
    logger.error(
      undefined,
      "Can't notify user about next booking, reason: %O",
      e
    );
  } finally {
    // TODO: check if user blocked the bot and delete him from the DB
  }
}
