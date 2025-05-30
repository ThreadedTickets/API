// src/tokenLoader.ts
import fs from "fs/promises";
import path from "path";
import { AccessToken } from "./types";
import { initializeTokenBuckets } from "./middleware/rateLimit";

let tokens: AccessToken[] = [];

export async function loadTokens() {
  try {
    tokens = require("./config/tokens").tokens;

    initializeTokenBuckets(tokens);
    console.log("Tokens reloaded successfully");
  } catch (error) {
    console.error("Error loading tokens:", error);
    throw error;
  }
}

export function getTokens(): AccessToken[] {
  return [...tokens];
}
