import { AccessToken } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: {
        token: AccessToken;
      };
    }
  }
}
