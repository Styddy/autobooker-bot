import { AutobookerContext, Markup } from "telegraf";
import telegram from "../../telegram";
import { database } from "../../bot";
import { Session } from "session";

/**
 * Write message to a specific user or to all existing users
 * @param ctx - telegram context
 * @param recipient - id or 'all.language'
 * @param message - text to write
 */
export async function write(
  ctx: AutobookerContext,
  recipient: string,
  message: string
) {
  if (!Number.isNaN(+recipient) && recipient.length >= 6) {
    // Write to a single user
    await telegram.sendMessage(Number(recipient), message);
    await ctx.reply(
      `Successfully sent message to: ${recipient}, content: ${message}`
    );
  } else if (recipient.includes("all")) {
    // Write to everyone
    const SUPPORTED_LANGUAGES = ["en"];
    const language = recipient.split(".")[1];

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      await ctx.reply(`Unsupported language ${language}`);
      return;
    }

    // const users = await User.find({ language }); // Filter by language

    // users.forEach((user, index) => {
    //   setTimeout(() => {
    //     telegram.sendMessage(Number(user._id), message);
    //   }, 200 * (index + 1));
    // });

    await ctx.reply(
      `Sending message to everyone is in process, content: ${message}`
    );
  } else {
    // Recipient wasn't specified correctly
    await ctx.reply(
      "No messages were sent. Please make sure that the command parameters are correct"
    );
  }
}

/**
 * Get users statistics
 * @param ctx - telegram context
 */
export async function getStats(ctx: AutobookerContext) {
  //const date = new Date();
  //const year = date.getFullYear();
  //const month = date.getMonth();
  //const day = date.getDate();
  //const epochTime = new Date(year, month, day).getTime();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = database.DB as any;
  const allUsers = db.getState().sessions.length;
  //const createdToday = await User.find({ created: { $gte: epochTime } }).count();
  //const activeToday = await User.find({ lastActivity: { $gte: epochTime } }).count();
  await ctx.reply(`Amount of users: ${allUsers}\n`); // + `New users: ${createdToday}\n` + `Active users: ${activeToday}
}

/**
 * Get users statistics
 * @param ctx - telegram context
 */
export async function setParking(
  ctx: AutobookerContext,
  action: string,
  user: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = database.DB as any;
  const sessions: { data: Session }[] = db.getState().sessions;

  if (!checkParkingAction(action)) {
    ctx.reply("Invalid action, actions must be one of:\n-set\n-remove");
    return false;
  }

  if (!sessions.find((session) => session.data.user.username === user)) {
    ctx.reply("No user found");
    return false;
  }

  const allParkings = [
    "PAR01",
    "PAR02",
    "PAR03",
    "PAR04",
    "PAR05",
    "PAR06",
    "PAR07",
    "PAR08",
    "PAR09",
    "PAR10",
    "PAR11",
    "PAR12",
    "PAR13",
  ];

  let occupiedParkings: string[];
  let availableParkings;
  switch (action) {
    case "-set":
      occupiedParkings = sessions
        .filter((session) => session.data.user.parking)
        .map((session) => session.data.user.parking as string);
      availableParkings = allParkings.filter(
        (x) => !occupiedParkings.includes(x)
      );
      if (availableParkings.length != 0) {
        ctx.reply(
          "Select one of available parkings:",
          Markup.inlineKeyboard(
            availableParkings.map((parking) => [
              Markup.button.callback(
                parking,
                JSON.stringify({ a: "addParking", u: user, p: parking })
              ),
            ])
          )
        );
      } else {
        ctx.reply("No parking left");
      }
      return true;
    case "-remove":
      //TODO remove directly the parking and show message
      break;
  }
  const allUsers = db.getState().sessions.length;
  //const createdToday = await User.find({ created: { $gte: epochTime } }).count();
  //const activeToday = await User.find({ lastActivity: { $gte: epochTime } }).count();
  await ctx.reply(`Amount of users: ${allUsers}\n`); // + `New users: ${createdToday}\n` + `Active users: ${activeToday}
}

function checkParkingAction(action: string) {
  switch (action) {
    case "-set":
    case "-remove":
      return true;
    default:
      return false;
  }
}

/**
 * Display help menu
 * @param ctx - telegram context
 */
export async function getHelp(ctx: AutobookerContext) {
  await ctx.reply(
    "write | [user_id | all] | message - write message to user\n" +
      "stats - get stats about users\n" +
      "help - get help menu"
  );
}
