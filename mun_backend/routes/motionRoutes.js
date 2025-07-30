import express from "express";
import {
  createMotion,
  getAllMotions,
} from "../controllers/motionController.js";
const motionRouter = express.Router();

motionRouter.get("/all", async (req, res) => {
  getAllMotions(req, res);
});

motionRouter.post("/add", async (req, res) => {
  createMotion(req, res);
});

export default motionRouter;
