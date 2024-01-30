import { AutobookerContext } from "telegraf";
import telegram from "../../telegram";
import { message } from "telegraf/filters";

/**
 * Sends a message to the admin
 * @param ctx - telegram context
 */
export async function sendMessage(ctx: AutobookerContext) {
  if (ctx.has(message("text"))) {
    const msg = `From: ${JSON.stringify(ctx.from)}.\n\nMessage: ${
      ctx.message.text
    }`;

    await telegram.sendMessage(process.env.ADMIN_ID, msg);
  }
}
