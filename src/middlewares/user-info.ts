/* eslint-disable @typescript-eslint/ban-types */
// Add some general info, like isPremium, language, etc...
import { AutobookerContext } from "telegraf";

/**
 * Modifies context and add some information about the user
 * @param ctx - telegram context
 * @param next - next function
 */
export const getUserInfo = async (ctx: AutobookerContext, next: Function) => {
  if (!ctx.session.language) {
    const user = ctx.session.user;

    if (user) {
      ctx.session.language = user.language;
      ctx.i18n.locale(user.language);
    }
  }

  return next();
};
