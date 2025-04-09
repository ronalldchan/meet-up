import express from "express";
import eventRoutes from "./eventRoutes";
const router = express.Router();

router.use("/events", eventRoutes);

export default router;
