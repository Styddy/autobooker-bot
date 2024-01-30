import { AutobookerContext } from "telegraf";
import logger from "./logger";
import { saveToSession } from "./session";

/**
 * Function that updates mail for the current user in all known places
 * @param ctx - telegram context
 * @param newMail - new mail
 */
export async function updateMail(ctx: AutobookerContext, newMail: string) {
  logger.debug(
    ctx,
    `Updating mail for user ${ctx.session.user.username} to ${newMail}`
  );
  ctx.session.user.mail = newMail.toString();
  saveToSession(ctx, "user", ctx.session.user); //TODO Verificare utilità della chiamata
}
