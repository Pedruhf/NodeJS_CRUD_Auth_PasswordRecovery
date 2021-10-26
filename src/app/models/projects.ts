import { mongoose } from "../../database";

// Determinando os campos dentro da tabela de projetos
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


// Definindo nosso modelo
const Project = mongoose.model("Project", projectSchema);

export { Project };