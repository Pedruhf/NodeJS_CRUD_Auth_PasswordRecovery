import express from "express";
import authMiddleware from "../../middlewares/auth";

const router = express.Router();

router.use(authMiddleware);

// Aplicando um middleware
router.get("/", (req, res) => {
  res.send({ ok: true, user: req.userId });
});

export { router };