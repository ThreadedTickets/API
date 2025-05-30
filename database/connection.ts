import mongoose from "mongoose";
import "dotenv/config";

export const connectToMongooseDatabase = async () => {
  if (!process.env["MONGOOSE_URI"]) {
    console.error(
      "To connect to the database you must provide a connection URI, username and password"
    );
    process.exit(1);
  }

  try {
    const databaseClient = await mongoose.connect(
      process.env["MONGOOSE_URI"] ?? ""
    );
    databaseClient.connection.useDb("ThreadedTs");

    console.log(
      `Connected to the database ${databaseClient.connection.db?.namespace} successfully`
    );
  } catch (err) {
    console.log("Failed to connect to database:", err as string);
    process.exit(1);
  }
};
