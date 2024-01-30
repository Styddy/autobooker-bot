import { IUser } from "../models/User";
import { SceneSession } from "telegraf/typings/scenes";

export type MessageToDelete = {
  chatId: number;
  messageId: number;
};

interface Session extends SceneSession {
  user: IUser;
  startScene: {
    subscene: "start" | "mail" | "password" | "confirm";
    messagesToDelete: MessageToDelete[];
  };
  settingsScene: {
    subscene: string;
    messagesToDelete: MessageToDelete[];
  };
  bookingsScene: {
    messagesToDelete: MessageToDelete[];
  };
  language: "en";
}
