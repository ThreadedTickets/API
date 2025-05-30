import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { loadRoutes } from "./routeLoader";
import { loadTokens } from "./tokenLoader";
import { authenticate } from "./middleware/auth";
import { rateLimiter } from "./middleware/rateLimit";
import { connectToMongooseDatabase } from "./database/connection";
import "dotenv/config"

const app = express();
const PORT = process.env.PORT || 3000;

connectToMongooseDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Admin endpoints for reloading
app.post(
  "/admin/reload-routes",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.token.permissions.includes("admin")) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      await loadRoutes(app);
      res.json({ success: true, message: "Routes reloaded" });
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  "/admin/reload-tokens",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.token.permissions.includes("admin")) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      await loadTokens();
      res.json({ success: true, message: "Tokens reloaded" });
    } catch (error) {
      next(error);
    }
  }
);

// Initialize
async function initialize() {
  try {
    await loadTokens();
    await loadRoutes(app);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}

initialize();
