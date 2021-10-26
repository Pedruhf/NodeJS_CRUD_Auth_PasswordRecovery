import { mongoose } from "../../database";

// Determinando os campos dentro da tabela de tarefas
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


// Definindo nosso modelo
const Task = mongoose.model("Task", taskSchema);

export { Task };