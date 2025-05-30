import { RouteModule } from "../types";
import { authenticate } from "../middleware/auth";
import { setRedisCache } from "../database/updateCache";
import { BlacklistSchema } from "../database/modals/Blacklist";
import { invalidateCache } from "../database/invalidateCache";

const routes: RouteModule[] = [
  {
    method: "get",
    path: "/blacklist/get",
    middleware: [authenticate],
    handler: async (req, res) => {
      const { id } = req.query;

      const document = await BlacklistSchema.findOne({
        id: id,
        deactivatedAt: null,
      });

      res.status(200).json(document?.toObject() || null);
    },
  },
  {
    method: "get",
    path: "/blacklist/history",
    middleware: [authenticate],
    handler: async (req, res) => {
      const { id } = req.query;

      const documents = await BlacklistSchema.find({
        id: id,
      });

      res.status(200).json(documents.map((d) => d.toObject()));
    },
  },
  {
    method: "post",
    path: "/blacklist/add",
    middleware: [authenticate],
    handler: async (req, res) => {
      if (!req.body) {
        res.json({ message: "I need a body" }).status(400);
        return;
      }

      const { id, reason, addedBy, type } = req.body;
      const document = await BlacklistSchema.findOne({
        id: id,
        deactivatedAt: null,
      });

      if (document) {
        res.status(500).json({ message: "ID already blacklisted" });
        return;
      }

      await BlacklistSchema.create({
        id,
        addedBy,
        reason,
        type,
      });

      setRedisCache(`blacklists:${id}`, `${reason}`);

      res.json({ message: "ID added to blacklist" }).status(200);
    },
  },
  {
    method: "delete",
    path: "/blacklist/delete",
    middleware: [authenticate],
    handler: async (req, res) => {
      const { id } = req.query;
      const document = await BlacklistSchema.findOneAndUpdate(
        {
          id: id,
        },
        { deactivatedAt: new Date() }
      );

      if (!document) {
        res.status(500).json({ message: "ID is not blacklisted" });
        return;
      }

      invalidateCache(`blacklists:${id}`);

      res.json({ message: "ID removed from blacklist" }).status(200);
    },
  },
];

export default routes;
