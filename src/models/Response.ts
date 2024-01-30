export interface IResponse {
  error:
    | {
        code: string;
        message: string;
      }
    | boolean;
  response: boolean | unknown;
  time: number;
}
