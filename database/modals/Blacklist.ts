import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["server", "user"],
    },
    reason: {
      type: String,
      required: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const BlacklistSchema = mongoose.model("Blacklists", schema);
