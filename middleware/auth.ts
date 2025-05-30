import { Request, Response, NextFunction } from "express";
import { AccessToken, ExpressMiddleware } from "../types";
import { getTokens } from "../tokenLoader";

export const authenticate: ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Authentication token required" });
    return;
  }

  const accessToken = getTokens().find((t) => t.token === token);
  if (!accessToken) {
    res.status(403).json({ error: "Invalid authentication token" });
    return;
  }

  req.user = { token: accessToken };
  next();
};
