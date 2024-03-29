import logger from "./logger";
import { sleep } from "./common";
import { IUser } from "../models/User";
import telegram from "../telegram";
import { IResponse } from "../models/Response";
import { getOggetti, login, setPrenotazione } from "./booking";
import TelegrafI18n from "telegraf-i18n";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { format } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function autobook(database: any, i18n: TelegrafI18n) {
  logger.debug(undefined, "Starting to autobook for next month's bookings");
  const workingDays = [1, 2, 3, 4, 5];
  const checkDate = new Date();
  checkDate.setDate(checkDate.getDate() + 32);
  if (workingDays.find((x) => x === checkDate.getDay())) {
    const users: IUser[] = [];
    database.getState().sessions.forEach((x: { data: { user: IUser } }) => {
      if (x.data.user.parking) users.push(x.data.user);
    });

    await autobookUsers(users, i18n);
  }
}

async function autobookUsers(users: IUser[], i18n: TelegrafI18n) {
  const usersBookingPromises: Promise<void>[] = [];
  for (const user of users) {
    if (user.parking) usersBookingPromises.push(autobookUser(user, i18n));
  }
  await Promise.all(usersBookingPromises);
}

async function autobookUser(user: IUser, i18n: TelegrafI18n) {
  const login = await manageLogin(user, i18n);
  let message = login.message;
  if (!login.error) {
    const sessionId = login.loginResponse.sessionId;
    const parkingsResponse = await getOggetti(sessionId, 32);
    if (typeof parkingsResponse.error !== "boolean") {
      message = parkingsResponse.error.message;
    } else if (
      !parkingsResponse.error &&
      typeof parkingsResponse.response !== "boolean"
    ) {
      const posto = getPosto(parkingsResponse, user.parking);
      const secondsTillMidnight: number = getSecondsTillMidnight();

      await sleep(secondsTillMidnight);
      message = await manageBooking(
        user,
        i18n,
        message,
        sessionId,
        posto.pk_oggetti
      );
    }
  }
  sendMessage(user._id, message);
  await sleep(0.5);
}

async function manageBooking(
  user: IUser,
  i18n: TelegrafI18n,
  message: string,
  sessionId: string,
  idParking: string
) {
  const getFormattedDate = (date: Date) => format(date, "yyyy-MM-dd");
  let parkingBooked = false;
  let requestTimeout = false;
  let request = 0;

  while (!parkingBooked && !requestTimeout) {
    const currentDate = new Date();
    const nextDateMorning = currentDate;
    nextDateMorning.setDate(currentDate.getDate() + 31);

    if (request > 300) {
      requestTimeout = true;
    }

    if (!parkingBooked) {
      request++;
      setPrenotazione(
        sessionId,
        idParking,
        getFormattedDate(nextDateMorning)
      ).then((prenotazioneResponse) => {
        if (typeof prenotazioneResponse.error !== "boolean") {
          message = prenotazioneResponse.error.message;
        } else if (
          !prenotazioneResponse.error &&
          typeof prenotazioneResponse.response !== "boolean"
        ) {
          parkingBooked = true;
          message = `${prenotazioneResponse.response as string}\n${i18n.t(
            user.language,
            "scenes.bookings.booking_confirmed",
            {
              date: getFormattedDate(nextDateMorning),
              object: user.parking,
            }
          )}`;
        }
      });
      await sleep(0.01);
    }
  }
  return message;
}

function getPosto(parkingResponse: IResponse, userParking: string) {
  const posti = parkingResponse.response as {
    nome: string;
    pk_oggetti: string;
  }[];
  return posti.find((posto) => posto.nome === userParking);
}

function getSecondsTillMidnight(): number {
  const now = new Date();
  let millisTillMidnight =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    ).getTime() - now.getTime();
  if (millisTillMidnight < 0) {
    millisTillMidnight = 0;
  }
  return (millisTillMidnight + 1) / 1000;
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
  }
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
