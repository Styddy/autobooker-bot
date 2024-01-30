import { AutobookerContext, Scenes } from "telegraf";
import { match } from "telegraf-i18n";
import { getMainKeyboard, getBackKeyboard } from "../../util/keyboards";
import logger from "../../util/logger";
import { write, getHelp, getStats, setParking } from "./helpers";
import { message } from "telegraf/filters";
import { parkingChangeAction } from "./actions";

const { leave } = Scenes.Stage;
const admin = new Scenes.BaseScene<AutobookerContext>("admin");

admin.enter(async (ctx: AutobookerContext) => {
  logger.debug(ctx, "Enters admin scene");
  const { backKeyboard } = getBackKeyboard(ctx);

  await ctx.reply("Welcome to Admin stage", backKeyboard);
});

admin.leave(async (ctx: AutobookerContext) => {
  logger.debug(ctx, "Leaves admin scene");
  const { mainKeyboard } = getMainKeyboard(ctx);

  await ctx.reply(ctx.i18n.t("shared.what_next"), mainKeyboard);
});

admin.command("saveme", leave());
admin.hears(match("keyboards.back_keyboard.back"), leave());
admin.action(/"addParking"/, parkingChangeAction);

admin.on(message("text"), async (ctx: AutobookerContext) => {
  if (ctx.has(message("text"))) {
    const [type, ...params] = ctx.message.text.split(" ");

    switch (type) {
      case "write":
        await write(ctx, params[0], params[1]);
        break;
      case "stats":
        await getStats(ctx);
        break;
      case "parking":
        await setParking(ctx, params[0], params[1]);
        break;
      case "help":
        await getHelp(ctx);
        break;
      default:
        ctx.reply("Command was not specified");
    }
  }
});

export default admin;
