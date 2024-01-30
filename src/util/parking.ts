import logger from "./logger";
import { IUser } from "../models/User";

/**
 * Function that updates parking for the current user in all known places
 * @param ctx - telegram context
 * @param newParking - new parking
 */
export async function updateParking(
  user: IUser,
  newParking:
    | "PAR01"
    | "PAR02"
    | "PAR03"
    | "PAR04"
    | "PAR05"
    | "PAR06"
    | "PAR07"
    | "PAR08"
    | "PAR09"
    | "PAR10"
    | "PAR11"
    | "PAR12"
    | "PAR13"
) {
  logger.debug(
    undefined,
    `Updating parking for user ${user.username} to ${newParking} %s`
  );
  user.parking = newParking;
}
