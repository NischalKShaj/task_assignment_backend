// <========================= file for creating the route for the application ================>

// importing the required modules
import express from "express";
import { homeController } from "../controller/homeController";
import { taskController } from "../controller/taskController";
import { authenticateUserJwt } from "../middleware/authentication";

// setting up the router
const router = express.Router();

// setting up the routes

// router for getting the home page
router.get("/", homeController.getHome);

// router for posting the data from the signup
router.post("/signup", homeController.postSignup);

// router for login
router.post("/login", homeController.postLogin);

// router for getting the tasks for the particular date
router.get("/tasks/:date", authenticateUserJwt, taskController.getTasks);

// router for adding a new task
router.post("/add-task", authenticateUserJwt, taskController.addTask);

// router for getting the tasks for a particular date and the employee
router.get(
  "/tasks/:date/:id",
  authenticateUserJwt,
  taskController.getEmployeeTask
);

// router for editing a particular task
router.put("/update-task/:id", authenticateUserJwt, taskController.editTask);

// router for deleting the task
router.delete(
  "/remove-task/:id",
  authenticateUserJwt,
  taskController.removeTask
);

// router for updating the status of the task
router.put(
  "/update-status/:id",
  authenticateUserJwt,
  taskController.updateStatus
);

// router for logout
router.get("/logout", authenticateUserJwt, homeController.userLogout);

export default router;
