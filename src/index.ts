// <===================== file for running the server of the application ===============>

// importing the required modules
import app from "./app";
import { connection } from "./config/database";
import dotenv from "dotenv";
dotenv.config();

// setting the port
const port = process.env.PORT || 5000;

// starting the server
const server = async () => {
  try {
    await connection();
    app.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });
  } catch (error) {
    console.error("error while creating the server");
  }
};

server();
