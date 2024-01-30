import { AutobookerContext } from "telegraf";
import logger from "./logger";
import { saveToSession } from "./session";

/**
 * Function that updates language for the current user in all known places
 * @param ctx - telegram context
 * @param newLang - new language
 */
export async function updateLanguage(ctx: AutobookerContext, newLang: "en") {
  logger.debug(
    ctx,
    `Updating language for user ${ctx.session.user.username} to ${newLang} %s`
  );
  saveToSession(ctx, "language", newLang);

  ctx.i18n.locale(newLang);
}
