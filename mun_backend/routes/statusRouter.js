import express from "express";
import db from "../config/db.js";
import { allowedCountries, attendanceValues } from "../models/countries.js";
import { motionTypes } from "../models/motion.js";
const statusRouter = express.Router();


statusRouter.get("/attendance", async (req, res) => {
  try {
    return res.status(200).json({
      status: "ok",
      attendance: attendanceValues,
    });
  } catch (error) {
    console.error("Error fetching attendance values:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

statusRouter.get("/motionTypes", async (req, res) => {
  try {
    return res.status(200).json({
      status: "ok",
      motionTypes: motionTypes,
    });
  } catch (error) {
    console.error("Error fetching motion types:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default statusRouter;
