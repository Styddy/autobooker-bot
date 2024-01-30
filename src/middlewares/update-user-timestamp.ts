/* eslint-disable @typescript-eslint/ban-types */
import { AutobookerContext } from "telegraf";

/**
 * Updated last activity timestamp for the user in database
 * @param ctx - telegram context
 * @param next - next function
 */
export const updateUserTimestamp = async (
  ctx: AutobookerContext,
  next: Function
) => {
  ctx.session.user.lastActivity = new Date().getTime();
  return next();
};
