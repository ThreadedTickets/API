import { Request, Response, NextFunction, RequestHandler } from "express";

export interface AccessToken {
  token: string;
  rateLimit: {
    capacity: number;
    tokensPerSecond: number;
  };
  permissions: string[];
}

export type ExpressHandler<T = any> = RequestHandler<
  any, // Params
  T, // Response body
  any, // Request body
  any, // Query params
  Record<string, any> // Locals
>;

export type ExpressMiddleware = RequestHandler<
  any, // Params
  any, // Response body
  any, // Request body
  any, // Query params
  Record<string, any> // Locals
>;

export interface RouteModule<T = any> {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  handler: RequestHandler<any, T, any, any, Record<string, any>>;
  middleware?: RequestHandler[];
  requiredPermissions?: string[]; // Add this new property
}

export type StrictRequestHandler = RequestHandler<
  any, // Params
  any, // Response body
  any, // Request body
  any, // Query params
  Record<string, any> // Locals
>;

export type StrictAsyncHandler = (
  req: Parameters<StrictRequestHandler>[0],
  res: Parameters<StrictRequestHandler>[1],
  next: Parameters<StrictRequestHandler>[2]
) => Promise<void>;
