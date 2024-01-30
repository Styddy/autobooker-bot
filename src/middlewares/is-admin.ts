/* eslint-disable @typescript-eslint/ban-types */
import { AutobookerContext } from "telegraf";
import { message } from "telegraf/filters";

/**
 * Checks whether user is admin and can access restricted areas
 * @param ctx - telegram context
 * @param next - next function
 */
export const isAdmin = async (ctx: AutobookerContext, next: Function) => {
  if (ctx.has(message("text"))) {
    const password = ctx.message.text.split(" ")[1];

    if (
      ctx.from.id === +process.env.ADMIN_ID &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return next();
    }

    return ctx.reply("Sorry, you are not an admin :(");
  }
};
