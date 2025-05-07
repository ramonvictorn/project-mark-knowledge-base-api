import express from "express";
import topicsRoutes from "./topics";
import usersRoutes from "./users";

const router = express.Router();

router.use("/topics", topicsRoutes);
router.use("/users", usersRoutes);

export default router;
