/* eslint-disable @typescript-eslint/no-explicit-any */
import { database } from "../../bot";
import { sleep } from "../../util/common";
import { updateParking } from "../../util/parking";
import { AutobookerContext } from "telegraf";
import { callbackQuery } from "telegraf/filters";

export const parkingChangeAction = async (ctx: AutobookerContext) => {
  if (ctx.has(callbackQuery("data"))) {
    const callbackData = JSON.parse(ctx.callbackQuery.data);
    const db = database.DB as any;
    const sessions: any[] = db.getState().sessions;
    await updateParking(
      sessions.find((session) => session.data.user.username === callbackData.u)
        .data.user,
      callbackData.p
    );
    await sleep(3);
    await ctx.answerCbQuery();
    await ctx.editMessageText(
      // @ts-expect-error ts(2339) for library lazy property initialization
      ctx.callbackQuery.message.text + "\n\nChoosen: " + callbackData.p
    );
  }
};
