import express from "express";
import { router as authRoutes } from "./app/controllers/authController"
import { router as projectRoutes } from "./app/controllers/projectController"

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);

app.listen(4000, () => {
  console.log("SERVER IS RUNNING ON PORT 4000");
});