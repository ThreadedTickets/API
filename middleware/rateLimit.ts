import { Request, Response, NextFunction } from "express";
import { AccessToken } from "../types";

class TokenBucket {
  private tokens: number;
  private lastFilled: number;
  private readonly capacity: number;
  private readonly tokensPerSecond: number;

  constructor(capacity: number, tokensPerSecond: number) {
    this.capacity = capacity;
    this.tokensPerSecond = tokensPerSecond;
    this.tokens = capacity;
    this.lastFilled = Date.now();
  }

  private refill() {
    const now = Date.now();
    const delta = (now - this.lastFilled) / 1000;
    const newTokens = delta * this.tokensPerSecond;
    this.tokens = Math.min(this.capacity, this.tokens + newTokens);
    this.lastFilled = now;
  }

  consume(tokens: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}

const tokenBuckets = new Map<string, TokenBucket>();

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers["authorization"]?.split(" ")[1];

  // If no token, skip rate limiting
  if (!token) {
    next();
    return;
  }

  const bucket = tokenBuckets.get(token);

  // If no bucket for this token, skip rate limiting
  if (!bucket) {
    next();
    return;
  }

  if (bucket.consume()) {
    next();
  } else {
    res.status(429).json({ error: "Rate limit exceeded" });
  }
};

export function initializeTokenBuckets(tokens: AccessToken[]): void {
  tokenBuckets.clear();
  tokens.forEach((token) => {
    tokenBuckets.set(
      token.token,
      new TokenBucket(token.rateLimit.capacity, token.rateLimit.tokensPerSecond)
    );
  });
}
