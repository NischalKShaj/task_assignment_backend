// <==================== file to set the cors options for the application ===============>

// importing the required modules
import dotenv from "dotenv";
dotenv.config();

// checking the environment
const baseUrl = process.env.BASE_URL_PRODUCTION;

if (!baseUrl) {
  throw new Error("base url not found");
}

// creating the options for the cors
export const corsOptions = {
  origin: baseUrl,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  credentials: true,
};
