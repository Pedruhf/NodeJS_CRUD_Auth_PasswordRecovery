import { mongoose } from "../../database";
import bcrypt from "bcryptjs";

// Determinando os campos dentro da tabela de usuários
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Encriptando a senha antes de salvar no banco
userSchema.pre("save", async function(next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  next();
});

// Definindo nosso modelo
const User = mongoose.model("User", userSchema);

export { User };