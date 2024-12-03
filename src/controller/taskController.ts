// <========================== file for creating the controller for the tasks ======================>

// importing the required modules
import { Request, Response } from "express";
import { Task } from "../models/task";
import { User } from "../models/user";

// creating the controller
class TaskController {
  // controller for getting the tasks from a particular date
  public getTasks = async (req: Request, res: Response) => {
    try {
      const { date } = req.params;
      const tasks = await Task.find({ dueDate: date });

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

      if (!employeeDetails) {
        res.status(403).json("employee not found");
        return;
      }

      const managerDetails = await User.findById({ _id: createdBy });

      if (!managerDetails) {
        res.status(403).json("manager not found");
        return;
      }

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
        return;
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

  // controller for getting the task for a particular employee on the given date
  public getEmployeeTask = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { date, id } = req.params;

      // Find tasks that are due on the specified date
      const tasks = await Task.find({ dueDate: date });

      let manager: any[] = [];
      let employee: any[] = [];

      if (tasks.length > 0) {
        let createdByIds = tasks.map((task) => task.createdBy);

        let employeeIds = tasks.map((task) => task.assignedTo);

        manager = await User.find({ _id: { $in: createdByIds } }).lean();

        employee = await User.find({ _id: { $in: employeeIds } }).lean();
      }

      const employeeDetails = await User.findOne({ _id: id });
      if (!employeeDetails) {
        res.status(403).json("user not found");
        return;
      }

      const tasksWithDetail = tasks.filter(
        (task) => task.assignedTo.toString() == id
      );

      const managerMap = new Map(
        manager.map((m) => [m._id.toString(), m.username])
      );
      const employeeMap = new Map(
        employee.map((e) => [e._id.toString(), e.username])
      );

      const tasksWithDetails = tasksWithDetail.map((task) => ({
        ...task,
        managerName:
          managerMap.get(task.createdBy.toString()) || "Unknown Manager",
        employeeName:
          employeeMap.get(task.assignedTo.toString()) || "Unknown Employee",
      }));

      res.status(202).json(tasksWithDetails);
    } catch (error) {
      console.error("error");
    }
  };

  // controller for editing the task
  public editTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description } = req.body;
      const { id } = req.params;

      const existingTask = await Task.findByIdAndUpdate(
        { _id: id },
        { $set: { title: title, description: description } },
        { new: true }
      );
      if (!existingTask) {
        res.status(403).json("task not found");
        return;
      }
      res.status(200).json(existingTask);
    } catch (error) {
      console.error("error", error);
    }
  };

  // controller for removing the task
  public removeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await Task.findByIdAndDelete({ _id: id });
      res.status(200).json("deleted successfully");
    } catch (error) {
      console.error("error", error);
    }
  };

  // controller for updating the status of the task
  public updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const { id } = req.params;

      const updatedTask = await Task.findByIdAndUpdate(
        { _id: id },
        { $set: { status: status } },
        { new: true }
      );

      res.status(200).json("updated");
    } catch (error) {
      console.error("error", error);
    }
  };

  // for the filtering of the task
  public filterTask = async (req: Request, res: Response) => {
    try {
      const { search, id, status } = req.params;
      console.log("search and status", search, status, id);
      const searchValue = search === "default" ? "" : search;

      const statusFilter = status === "all" ? null : status;

      // building query object
      const query: any = {};

      if (id) {
        query.$or = [{ assignedTo: id }, { createdBy: id }];
      }

      if (statusFilter) {
        query.status = statusFilter;
      }

      if (searchValue) {
        const managers = await User.find({
          username: { $regex: searchValue, $options: "i" },
        }).lean();

        const managerIds = managers.map((manager) => manager._id);

        query.createdBy = { $in: managerIds };
      }

      const tasks = await Task.find(query);

      let manager: any[] = [];
      let employee: any[] = [];

      if (tasks.length > 0) {
        const createdByIds = tasks.map((task) => task.createdBy);
        const employeeIds = tasks.map((task) => task.assignedTo);

        manager = await User.find({ _id: { $in: createdByIds } });
        employee = await User.find({ _id: { $in: employeeIds } });
      }

      const managerMap = new Map(
        manager.map((m) => [m._id.toString(), m.username])
      );

      const employeeMap = new Map(
        employee.map((e) => [e._id.toString(), e.username])
      );

      const tasksWithDetail = tasks.map((task) => ({
        ...task,
        managerName:
          managerMap.get(task.createdBy.toString()) || "unknown manager",
        employeeName:
          employeeMap.get(task.assignedTo.toString()) || "unknown employee",
      }));
      res.status(200).json(tasksWithDetail);
    } catch (error) {
      console.error("error", error);
    }
  };
}

export const taskController = new TaskController();
