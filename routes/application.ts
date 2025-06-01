import { RouteModule } from "../types";
import { authenticate } from "../middleware/auth";
import { toTimeUnit } from "../database/toTimeUnit";
import { getCachedDataElse } from "../database/getCachedElse";
import axios from "axios";

const routes: RouteModule[] = [
  {
    method: "get",
    path: "/create/application/check",
    middleware: [authenticate],
    handler: async (req, res) => {
      if (!req.query) {
        res.json({ message: "Please provide a creator id" }).status(400);
        return;
      }
      const { id } = req.query;
      if (!id) {
        res.json({ message: "Please provide a creator id" }).status(400);
        return;
      }

      const data = await getCachedDataElse(
        `applicationCreators:${id}`,
        toTimeUnit("seconds", 0, 0, 0, 1),
        async () => {
          res
            .json({ message: "No document was found (has it expired?)" })
            .status(404);
        }
      );

      if (data.cached)
        res.json({ message: "Found document!", data: data.data }).status(200);
    },
  },
  {
    method: "post",
    path: "/create/application/save",
    middleware: [authenticate],
    handler: async (req, res) => {
      const { id } = req.query;

      if (!id) {
        res.status(400).json({ message: "Please provide a creator id" });
        return;
      }

      const BOT_URL = process.env.BOT_URL;
      const BOT_API_TOKEN = process.env.BOT_API_TOKEN;
      if (!BOT_URL) {
        res
          .status(500)
          .json({ message: "Missing BOT_URL environment variable" });
        return;
      }

      try {
        const response = await axios.post(
          `${BOT_URL}/create/application/save?id=${id}`,
          req.body,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${BOT_API_TOKEN}`,
            },
          }
        );

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
