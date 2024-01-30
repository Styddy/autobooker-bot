export interface IUser {
  _id: string;
  created: number;
  username: string;
  name: string;
  mail: string;
  password: string;
  parking:
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
    | "PAR13";
  lastActivity: number;
  language: "en";
  confirmed: boolean;
}
