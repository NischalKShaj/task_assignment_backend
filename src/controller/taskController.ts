// <========================== file for creating the controller for the tasks ======================>

// importing the required modules
import { Request, Response } from "express";
import { Task } from "../models/task";
import { User } from "../models/user";
import { create } from "domain";

// creating the controller
class TaskController {
  // controller for getting the tasks
  public getTasks = async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      console.log("date", date);
      const tasks = await Task.find({ createdAt: date });

      let manager: any[] = [];
      let employee: any[] = [];
      if (tasks.length > 0) {
        let createdByIds = tasks.map((task) => task.createdBy);

        let employeeIds = tasks.map((task) => task.assignedTo);

        manager = await User.find({ _id: { $in: createdByIds } }).lean();

        employee = await User.find({ _id: { $in: employeeIds } }).lean();
      }
      // Create a map for quick lookup of manager and employee names
      const managerMap = new Map(
        manager.map((m) => [m._id.toString(), m.username])
      );
      const employeeMap = new Map(
        employee.map((e) => [e._id.toString(), e.username])
      );

      const tasksWithDetails = tasks.map((task) => ({
        ...task,
        managerName:
          managerMap.get(task.createdBy.toString()) || "Unknown Manager",
        employeeName:
          employeeMap.get(task.assignedTo.toString()) || "Unknown Employee",
      }));

      console.log("tasksWithDetails", tasksWithDetails);
      res.status(202).json(tasksWithDetails);
    } catch (error) {
      console.error("error", error);
    }
  };

  // controller for adding a new task
  public addTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, employee, createdAt, dueDate, createdBy } =
        req.body;

      const employeeDetails = await User.findOne({ email: employee });
      console.log("employee", employeeDetails);

      if (!employeeDetails) {
        res.status(403).json("employee not found");
        return;
      }

      const managerDetails = await User.findById({ _id: createdBy });
      console.log("manager", managerDetails?.username);

      if (!managerDetails) {
        res.status(403).json("manager not found");
        return;
      }

      // Log the input date strings for debugging
      console.log("Created At:", createdAt, "Due Date:", dueDate);

      // Validate and convert the date strings
      const convertToDate = (dateString: string): Date => {
        const trimmedDate = dateString.trim();
        const [datePart, timePart] = trimmedDate.split(", ");
        const [day, month, year] = datePart.split("/");

        // Create a new Date object using UTC to avoid timezone issues
        const date = new Date(
          Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))
        );

        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${trimmedDate}`);
        }
        return date;
      };

      let createdAtDate;
      let endDate;

      try {
        createdAtDate = convertToDate(createdAt);
        endDate = convertToDate(dueDate);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
        return; // Return to prevent further execution
      }

      const newTask = new Task({
        title: title,
        description,
        createdAt: createdAtDate,
        dueDate: endDate,
        createdBy: managerDetails?._id,
        assignedTo: employeeDetails?._id,
        status: "pending",
      });

      console.log("new Task", newTask);

      await newTask.save();

      res.status(201).json({
        _doc: newTask,
        managerName: managerDetails?.username,
        employeeName: employeeDetails?.username,
      });
    } catch (error) {
      console.error("error", error);
    }
  };
}

export const taskController = new TaskController();
