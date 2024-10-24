// <========================== file to create the schema for the user ================>

// importing the required modules
import { Schema, model } from "mongoose";

// creating the schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["employee", "manager"],
    required: true,
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  profileImage: {
    type: String,
    default:
      "https://i.pinimg.com/736x/c0/27/be/c027bec07c2dc08b9df60921dfd539bd.jpg",
  },
});

// exporting the schema
export const User = model("User", userSchema);
