// <================== creating the home controller for the application ===============>

// importing the required modules
import { Request, Response } from "express";
import { User } from "../models/user";
import { Task } from "../models/task";
import { compare, hashSync } from "bcryptjs";
import { SignupRequestBody } from "../types/types";
import { generateToken } from "../middleware/generateJWT";

// defining the controller
class HomeController {
  // controller for getting the home page
  public getHome = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(202).json({ message: "welcome to the home page" });
    } catch (error: unknown) {
      if (typeof error === "string") {
        throw new Error(error);
      } else {
        throw new Error("unexpected error occurred");
      }
    }
  };

  // controller for posting the data for user
  public postSignup = async (
    req: Request<{}, {}, SignupRequestBody>,
    res: Response
  ): Promise<void> => {
    try {
      const { email, username, password, role, phone } = req.body;
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        res.status(403).json({ message: "User already exists" });
        return;
      }

      const hashedPassword = hashSync(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        phone,
      });
      if (newUser.role === "manager") {
        newUser.manager = newUser._id;
      }
      await newUser.save();

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error in postSignup:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  };

  // controller for performing the login
  public postLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      console.log(email, password);
      const user = await User.findOne({ email });
      if (!user) {
        res.status(403).json({ message: "user not found" });
        return;
      }
      const hashedPassword = user.password;
      const originalPassword = compare(password, hashedPassword);

      if (!originalPassword) {
        res.status(403).json({ message: "invalid password" });
        return;
      }

      // create the token
      const token = generateToken({ email: user.email, role: user.role });

      console.log(token);

      const data = {
        username: user.username,
        email: user.email,
        role: user.role,
        _id: user._id,
        profile: user.profileImage,
      };

      res
        .cookie("access_token", token, { httpOnly: true })
        .status(202)
        .json({ data: data, token: token });
    } catch (error) {
      console.error("Error occurred in the login", error);
      res.status(500).json({ message: error });
    }
  };

  // controller for user logout
  public userLogout = async (req: Request, res: Response) => {
    try {
      res.clearCookie("access_token").status(200).json("user logged out");
    } catch (error) {
      console.error("error", error);
    }
  };
}

export const homeController = new HomeController();
