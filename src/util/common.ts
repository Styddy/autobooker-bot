import { AutobookerContext } from "telegraf";
import { Scene, saveToSession } from "./session";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { MessageToDelete } from "session";
import { Message } from "telegraf/typings/core/types/typegram";

/**
 * Pauses execution for given amount of seconds
 * @param sec - amount of seconds
 */
export function sleep(sec: number) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

/**
 * Checks whether given number is in range of base plus/minus step
 * @param number - number to check
 * @param base - base number to compare with
 * @param step - range for a number
 */
export function isNumberInRage(number: number, base: number, step: number = 1) {
  return number >= base - step && number <= base + step;
}

/**
 * Send message and saving it to the session. Later it can be deleted.
 * Used to avoid messages duplication
 * @param ctx - telegram context
 * @param translationKey - translation key
 * @param extra - extra for the message, e.g. keyboard
 */
export async function sendMessageToBeDeletedLater(
  ctx: AutobookerContext,
  text: string,
  scene: Scene,
  extra: ExtraReplyMessage
) {
  ctx.webhookReply = false;
  const message = await ctx.reply(text, extra);
  saveSceneToSession(ctx, scene, message);
}

function saveSceneToSession(
  ctx: AutobookerContext,
  scene: Scene,
  message: Message.TextMessage
) {
  let messagesToDelete: MessageToDelete[] = [];
  let sceneSession: {
    subscene?: string;
    messagesToDelete: MessageToDelete[];
  };

  if (ctx.session?.[scene]?.messagesToDelete) {
    messagesToDelete = ctx.session?.[scene]?.messagesToDelete;
  }

  if (ctx.session?.[scene]) {
    sceneSession = ctx.session[scene];
  } else {
    sceneSession = {
      messagesToDelete: messagesToDelete,
    };
  }

  sceneSession.messagesToDelete = [
    ...messagesToDelete,
    {
      chatId: message.chat.id,
      messageId: message.message_id,
    },
  ];

  if (!ctx.session[scene]) {
    saveToSession(ctx, scene, sceneSession);
  }
}

export async function deleteMessages(ctx: AutobookerContext, scene: Scene) {
  let sceneSession: {
    subscene?: "start" | "mail" | "password" | "confirm";
    messagesToDelete: MessageToDelete[];
  };
  for (const message of ctx.session[scene].messagesToDelete) {
    await ctx.telegram
      .deleteMessage(message.chatId, message.messageId)
      .catch(() => 1);
  }
  sceneSession.messagesToDelete = [];
  saveToSession(ctx, scene, sceneSession);
}

export async function deleteButtons(ctx: AutobookerContext, scene: Scene) {
  let sceneSession: {
    subscene?: string;
    messagesToDelete: MessageToDelete[];
  };
  if (ctx.session[scene]?.messagesToDelete) {
    sceneSession = ctx.session[scene];
    for (const message of ctx.session[scene].messagesToDelete) {
      await ctx.telegram
        .editMessageReplyMarkup(
          message.chatId,
          message.messageId,
          undefined,
          undefined
        )
        .catch(() => 1);
    }
    sceneSession.messagesToDelete = [];
    saveToSession(ctx, scene, sceneSession);
  }
}
