// <========================= file for creating the route for the application ================>

// importing the required modules
import express from "express";
import { homeController } from "../controller/homeController";

// setting up the router
const router = express.Router();

// setting up the routes

// router for getting the home page
router.get("/", homeController.getHome);

// router for posting the data from the signup
router.post("/signup", homeController.postSignup);

// router for login
router.post("/login", homeController.postLogin);

export default router;
