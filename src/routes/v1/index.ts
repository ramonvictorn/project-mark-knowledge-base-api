import express from "express";
import topicsRoutes from "./topics";

const router = express.Router();

router.use("/topics", topicsRoutes);

export default router;
