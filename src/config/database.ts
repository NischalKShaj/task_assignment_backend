// <=================== file to establish the database connection ===============>

// importing the required modules
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// for setting the environment of the application
let mongo_uri: string | undefined = "";

mongo_uri = process.env.MONGODB_URI;

console.log("url", mongo_uri);

// checking the mongodb_uri
if (!mongo_uri) {
  throw new Error("mongo db uri not found");
}

// creating the function for the establishing the connection
export const connection = async () => {
  try {
    await mongoose.connect(mongo_uri as string);
    console.log("database connected");
  } catch (error) {
    console.error("error", error);
    process.exit(1);
  }
};
