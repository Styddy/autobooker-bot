import { I18n } from "telegraf-i18n";
import { Context } from "telegraf";
import { Session } from "session";

declare module "telegraf" {
  interface AutobookerContext extends Context {
    i18n: I18n;
    scene: SceneContextScene<Session>;
    session: Session;
    webhookReply: boolean;
  }
}
