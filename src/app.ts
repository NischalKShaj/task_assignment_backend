// <==================== file to configure the server for the application =================>

// importing the required modules
import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsOptions } from "./config/cors";
import router from "./router/router";
dotenv.config();

// setting the app
const app = express();

// for parsing the data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// enabling the cors policy
app.use(cors(corsOptions));

// setting the routers
app.use("/", router);

// setting the 404 error
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "page not found" });
});

// setting the error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "internal server error" });
});

// exporting the app
export default app;
