import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user";
import authConfig from "../../config/auth.json";
import { transport as mailer } from "../../modules/mailer";

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
  });
}

router.post("/register", async (req, res) => {
  const { email } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: "User already exists" });
    }

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id })
    });
  } catch {
    return res.status(400).send({ error: "Registration failed" });
  }
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).send({ error: "User not found"});
  }

  const equalsPasswords = await bcrypt.compare(password, user.password);

  if (!equalsPasswords) {
    return res.status(400).send({ error: "Invalid password "});
  }

  user.password = undefined;

  res.send({
    user,
    token: generateToken({ id: user.id })
  });
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: "User not found"});
    }

    const token = crypto.randomBytes(20).toString("hex");

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      "$set": {
        passwordResetToken: token,
        passwordResetExpires: now,
      }
    });

    mailer.sendMail({
      to: email,
      from: "delauraph@gmail.com",
      html: `<p>Você esqueceu a senha? Não tem problema, utilize este token: ${token}</p>`,
      headers: { token }
    }, (err) => {
      if (err) {
        return res.status(400).send({ error: "Cannot send forgot password email" });
      }

      return res.send();
    });

  } catch {
    res.status(400).send({ error: "Error on forgot password, try again" });
  }
});

router.post("/reset_password", async (req, res) => {
  const { email, token, password } = req.body;

  try {
    const user = await User.findOne({ email }).
      select("+passwordResetToken passwordResetExpires");

    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    if (token !== user.passwordResetToken) {
      return res.status(400).send({ error: "Token invalid" });
    }

    const now = Date();

    if (now > user.passwordResetExpires) {
      return res.status(400).send({ error: "Token expired, generate a new one" });
    }

    user.password = password;

    await user.save();

    return res.send();

  } catch {
    res.status(400).send({ error: "Cannot reset password, try again" });
  }
});

export { router };