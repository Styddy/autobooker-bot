import fetch from "node-fetch";
import { IResponse } from "../models/Response";
import { format } from "date-fns";

const url = "https://www.finsoft.it/booking/be/api.php?_cedilla_route=";

const getHeaders = (sessionId: string) => {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    cookie: sessionId,
  };
};

export async function login(email: string, password: string) {
  let sessionId: string;
  let response: IResponse;
  const credentials = JSON.stringify({
    email: email,
    password: password,
    remember_me: false,
  });
  await fetch(`${url}auth:login`, {
    headers: getHeaders(null),
    body: credentials,
    method: "POST",
  })
    .then((response) => {
      if (response.status === 200) {
        sessionId = response.headers.get("set-cookie");
      } else {
        throw new Error("Login error!");
      }
      return response.json();
    })
    .then((data) => {
      response = data;
    });
  return { sessionId, response };
}

export async function getOggetti(sessionId: string, deltaDays: number) {
  const currentDate = new Date();
  const nextDateMorning = currentDate;
  nextDateMorning.setDate(currentDate.getDate() + deltaDays);
  nextDateMorning.setHours(9);
  nextDateMorning.setMinutes(0);
  const nextDateEvening = new Date(nextDateMorning.getTime());
  nextDateEvening.setHours(18);

  const getFormattedDateHours = (date: Date) =>
    format(date, "yyyy-MM-dd hh:mm");

  const bodyOggetti = JSON.stringify({
    data_da: getFormattedDateHours(nextDateMorning),
    data_a: getFormattedDateHours(nextDateEvening),
    tipo: "3",
    sede: "1",
    piano: "2",
    luogo: "18",
  });

  let oggetti: IResponse;
  await fetch(`${url}booking:get_oggetti`, {
    headers: getHeaders(sessionId),
    body: bodyOggetti,
    method: "POST",
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("get_oggetti error!");
      }
    })
    .then((data: IResponse) => {
      oggetti = data;
    });
  return oggetti;
}

export async function getPrenotazioni(sessionId: string, deltaDays: number) {
  const timeEnd = new Date();
  timeEnd.setDate(timeEnd.getDate() + deltaDays);

  const bodyPrenotazione = JSON.stringify({
    sede: "1",
    time_start: new Date().toISOString(),
    time_end: timeEnd.toISOString(),
  });

  let bookings: IResponse;

  await fetch(`${url}user:get_prenotazioni`, {
    headers: getHeaders(sessionId),
    body: bodyPrenotazione,
    method: "POST",
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Login error!");
      }
    })
    .then((data: IResponse) => {
      bookings = data;
    });
  return bookings;
}

export async function setPrenotazione(
  sessionId: string,
  posto: string,
  data: string
) {
  let response: IResponse;
  const bodyPrenotazione = JSON.stringify({
    oggetto: posto,
    ospite: null,
    notifica_ospite: false,
    descrizione: "",
    tipologia: "Singola",
    data: data,
    intervallo: "1",
  });

  await fetch(`${url}booking:set_prenotazione`, {
    headers: getHeaders(sessionId),
    body: bodyPrenotazione,
    method: "POST",
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Login error!");
      }
    })
    .then((data: IResponse) => {
      response = data;
    });
  return response;
}

export async function annullaPrenotazione(sessionId: string, id: string) {
  let response;
  await fetch(`${url}booking:annulla_prenotazione`, {
    headers: getHeaders(sessionId),
    body: JSON.stringify({ id: id }),
    method: "POST",
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Login error!");
      }
    })
    .then((data) => {
      response = data;
    });
  return response;
}

export async function convalidaPrenotazione(sessionId: string, id: string) {
  let response;
  await fetch(`${url}booking:convalida_prenotazione`, {
    headers: getHeaders(sessionId),
    body: JSON.stringify({ id: id }),
    method: "POST",
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Login error!");
      }
    })
    .then((data) => {
      response = data;
    });
  return response;
}
