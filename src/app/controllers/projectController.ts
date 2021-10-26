import express from "express";
import authMiddleware from "../middlewares/auth";
import { Project } from "../models/projects";
import { Task } from "../models/task";
import { mongoose } from "../../database";

const router = express.Router();

router.use(authMiddleware);

interface ITask {
  title: string;
  project: mongoose.Schema.Types.ObjectId;
  assignedTo: mongoose.Schema.Types.ObjectId;
  completed: Boolean;
  createdAt?: Date;
};

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate(["user", "tasks"]);

    return res.send({ projects });
  } catch {
    return res.status(400).send({ error: "Error loading projects" });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(["user", "tasks"]);

    return res.send({ project });
  } catch {
    return res.status(400).send({ error: "Error loading project" });
  }
})

router.post("/", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    const project = await Project.create({ title, description, user: req.userId });

    await Promise.all(tasks.map(async (task: ITask) => {
      // new Task() -> Cria mas não salva
      // Task.create() -> Cria e salva no banco

      const projectTask = new Task({ ...task, project: project._id });
      
      await projectTask.save();

      project.tasks.push(projectTask);
    }));

    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: "Error creating new project" });
  }
});

router.put("/:projectId", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;

    const project = await Project.findByIdAndUpdate(req.params.projectId, {
      title,
      description,
    }, { new: true });

    project.tasks = [];
    await Task.remove({ project: project._id });

    await Promise.all(tasks.map(async (task: ITask) => {
      // new Task() -> Cria mas não salva
      // Task.create() -> Cria e salva no banco

      const projectTask = new Task({ ...task, project: project._id });
      
      await projectTask.save();

      project.tasks.push(projectTask);
    }));

    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: "Error updating project" });
  }
})

router.delete("/:projectId", async (req, res) => {
  try {
    await Project.findByIdAndRemove(req.params.projectId);

    return res.send();
  } catch {
    return res.status(400).send({ error: "Error removing project" });
  }
})

export { router };