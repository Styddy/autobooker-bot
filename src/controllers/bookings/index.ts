import { AutobookerContext, Scenes } from "telegraf";
import { match } from "telegraf-i18n";
import {
  backCancelBookingAction,
  bookingsEnterAction,
  cancelBookingAction,
  confirmCancelBookingAction,
} from "./actions";
import { getMainKeyboard } from "../../util/keyboards";
import { deleteButtons } from "../../util/common";
import { deleteFromSession } from "../../util/session";

const bookings = new Scenes.BaseScene<AutobookerContext>("bookings");

bookings.enter(async (ctx: AutobookerContext) => {
  bookingsEnterAction(ctx);
});

bookings.leave(async (ctx: AutobookerContext) => {
  await deleteButtons(ctx, "bookingsScene");
  await ctx.reply(
    ctx.i18n.t("shared.what_next"),
    getMainKeyboard(ctx).mainKeyboard
  );
  deleteFromSession(ctx, "bookingsScene");
});

bookings.command("saveme", async (ctx: AutobookerContext) => {
  ctx.scene.leave();
});

bookings.hears(
  match("keyboards.back_keyboard.back"),
  async (ctx: AutobookerContext) => {
    ctx.scene.leave();
  }
);

bookings.action(/"cancel"/, cancelBookingAction);
bookings.action(/"backCancel"/, backCancelBookingAction);
bookings.action(/"confirmCancel"/, confirmCancelBookingAction);
bookings.hears(match("scenes.bookings.refresh"), bookingsEnterAction);

export default bookings;
