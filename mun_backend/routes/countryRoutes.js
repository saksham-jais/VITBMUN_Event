import express from "express";
import {
  createCountry,
  getCountries,
  updateAttendanceStatus,
} from "../controllers/countryController.js";
import { allowedCountries } from "../models/countries.js";

const countryRouter = express.Router();

countryRouter.post("/add", createCountry);
countryRouter.get("/all", getCountries);
countryRouter.post("/update", updateAttendanceStatus);
countryRouter.get("/values", (req, res) => {
  res.status(200).json({
    allowedCountries,
  });
});

export default countryRouter;
