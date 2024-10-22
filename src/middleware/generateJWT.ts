// <========================== file to create the jwt token ===========================>

// importing the required modules
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// creating the jwt token
export const generateToken = (user: { email: string; role: string }) => {
  const secret = process.env.SECRET;

  if (!secret) {
    throw new Error("no secret key was given");
  }

  const payload = {
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, secret, { expiresIn: "72h" });
};
