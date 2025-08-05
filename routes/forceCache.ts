import axios from "axios";
import { authenticate } from "../middleware/auth";
import { RouteModule } from "../types";

const routes: RouteModule[] = [
  {
    method: "post",
    path: "/forceCache",
    middleware: [authenticate],
    handler: async (req, res) => {
      const BOT_URL = process.env.BOT_URL;
      const BOT_API_TOKEN = process.env.BOT_API_TOKEN;
      if (!BOT_URL) {
        res
          .status(500)
          .json({ message: "Missing BOT_URL environment variable" });
        return;
      }

      try {
        const response = await axios.post(`${BOT_URL}/forceCache`, req.body, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${BOT_API_TOKEN}`,
          },
        });

        res.status(response.status).json(response.data);
      } catch (error: any) {
        const message =
          error?.response?.data?.message ??
          error?.message ??
          "Unknown error occurred";

        res.status(500).json({
          message: `Failed to forward request to bot`,
        });
      }
    },
  },
];

export default routes;
