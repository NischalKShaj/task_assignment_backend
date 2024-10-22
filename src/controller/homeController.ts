// <================== creating the home controller for the application ===============>

// importing the required modules
import { Request, Response } from "express";
import { User } from "../models/user";

// defining the controller
class HomeController {
  // controller for getting the home page
  public async getHome(req: Request, res: Response) {
    try {
      res.status(202).json({ message: "welcome to the home page" });
    } catch (error: unknown) {
      if (typeof error === "string") {
        throw new Error(error);
      } else {
        throw new Error("unexpected error occurred");
      }
    }
  }

  // controller for posting the data for user
  public async postSignup(req: Request, res: Response) {}
}

export const homeController = new HomeController();
