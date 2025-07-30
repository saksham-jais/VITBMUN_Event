import express from "express";
import {
  createCommittee,
  getCommitteeById,
} from "../controllers/committeeController.js";
const committeeRouter = express.Router();

committeeRouter.get("/", getCommitteeById);
committeeRouter.post("/add", createCommittee);

export default committeeRouter;
