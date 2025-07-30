import db from "../config/db.js";
import fs from "fs";
import path from "path";
import { formatError, generateCode } from "../utils/helper.js";

export const createCountry = async (req, res) => {
  try {
    const { country } = req.body;
    if (!Array.isArray(country) || country.length === 0) {
      return res.status(400).json(
        formatError({
          status: 400,
          title: "Validation Error",
          description:
            "Provide a non-empty array of country names in 'country'.",
        })
      );
    }

    const validNames = country.map((n) => n.trim()).filter((n) => n.length > 0);

    if (validNames.length === 0) {
      return res.status(400).json(
        formatError({
          status: 400,
          title: "Validation Error",
          description: "All country names are empty or invalid.",
        })
      );
    }
    const committeeId = 1;
    const payload = validNames.map((name) => ({
      id: generateCode("CTR"),
      name,
      committeeId,
    }));

    try {
      const countries = await db.country.bulkCreate(payload);
      return res.status(201).json({
        message: "Countries created successfully",
        countries,
      });
    } catch (e) {
      console.error("Error creating countries:", e);
      return res.status(400).json(
        formatError({
          status: 400,
          title: "Repeated or Invalid Country Names",
          description:
            "One or more country names are invalid or already exist in the database.",
        })
      );
    }
  } catch (error) {
    console.error("Error creating countries:", error);
    return res.status(500).json(
      formatError({
        status: 500,
        title: "Internal Server Error",
        description:
          "Could not create countries due to a server error or missing country names.",
      })
    );
  }
};

export const getCountries = async (req, res) => {
  try {
    const countries = await db.country.findAll();

    if (!countries || countries.length == 0) {
      return res.status(404).json(
        formatError({
          status: 404,
          title: "Not Found",
          description: "No countries found in this committee",
        })
      );
    }

    return res.status(200).json({
      message: "Countries fetched successfully",
      countries,
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return res.status(500).json(
      formatError({
        status: 500,
        title: "Internal Server Error",
        description: "An error occurred while retrieving countries.",
      })
    );
  }
};

export const updateAttendanceStatus = async (req, res) => {
  try {
    const { countryId, attendanceStatus } = req.body;

    if (!countryId || !attendanceStatus) {
      return res.status(400).json(
        formatError({
          status: 400,
          title: "Validation Error",
          description: "The 'attendanceStatus' or 'countryId' was missing.",
        })
      );
    }

    const country = await db.country.findOne({
      where: { id: countryId },
    });

    if (!country) {
      return res.status(404).json(
        formatError({
          status: 404,
          title: "Not Found",
          description: "Country not found for the given committee.",
        })
      );
    }

    try {
      country.attendance = attendanceStatus;
      await country.save();

      return res.status(200).json({
        message: "Attendance status updated successfully",
        country,
      });
    } catch (error) {
      console.error("Error updating attendance status:", error);
      return res.status(400).json(
        formatError({
          status: 400,
          title: "Bad Request",
          description: "Invalid attendance status provided.",
        })
      );
    }
  } catch (error) {
    console.error("Error updating attendance status:", error);
    return res.status(500).json(
      formatError({
        status: 500,
        title: "Internal Server Error",
        description:
          "Could not update attendance due to a server error or countryId and attendanceStatus are not provided.",
      })
    );
  }
};