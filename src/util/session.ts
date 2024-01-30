import { AutobookerContext } from "telegraf";
import logger from "./logger";
import { Session } from "session";

export type SessionDataField =
  | "user"
  | "startScene"
  | "settingsScene"
  | "bookingsScene"
  | "language";

export type Scene = "startScene" | "settingsScene" | "bookingsScene";

/**
 * Saving data to the session
 * @param ctx - telegram context
 * @param field - field to store in
 * @param data - data to store
 */
export function saveToSession(
  ctx: AutobookerContext,
  field: keyof Session,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): void {
  logger.debug(ctx, "Saving %s to session", field);
  ctx.session[field] = data;
}

/**
 * Removing data from the session
 * @param ctx - telegram context
 * @param field - field to delete
 */
export function deleteFromSession(
  ctx: AutobookerContext,
  field: SessionDataField
) {
  logger.debug(ctx, "Deleting %s from session", field);
  delete ctx.session[field];
}
