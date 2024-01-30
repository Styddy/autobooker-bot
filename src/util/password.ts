import { AutobookerContext } from "telegraf";
import logger from "./logger";
import { saveToSession } from "./session";

/**
 * Function that updates mail for the current user in all known places
 * @param ctx - telegram context
 * @param newMail - new mail
 */
export function updatePassword(ctx: AutobookerContext, newPassword: string) {
  logger.debug(
    ctx,
    `Updating password for user ${ctx.session.user.username} to ${newPassword} %s`
  );
  ctx.session.user.password = newPassword;
  saveToSession(ctx, "user", ctx.session.user); //TODO Verificare utilità della chiamata
}

/**
 * Function that updates mail for the current user in all known places
 * @param ctx - telegram context
 * @param newMail - new mail
 */
export function updateConfirmation(
  ctx: AutobookerContext,
  newConfirmation: boolean
) {
  logger.debug(
    ctx,
    `Updating confirmation for user ${ctx.session.user.username} to ${newConfirmation}`
  );
  ctx.session.user.confirmed = newConfirmation;
  saveToSession(ctx, "user", ctx.session.user); //TODO Verificare utilità della chiamata
}
