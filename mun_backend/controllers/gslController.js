import db from "../config/db.js";
import { gslValues } from "../models/countries.js";
import { formatError } from "../utils/helper.js";
import { Op } from "sequelize"; 

export const getGslStatus = async (req, res) => {
  try {
    const countries = await db.country.findAll({
      where: {
        attendance: {
          [Op.in]: ["Present", "Present and Voting"], 
        },
      },
      attributes: ["id", "name", "gsl"],
    });
    return res.status(200).json({
      message: "GSL status",
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

export const gslEdit = async (req, res) => {
  try {
    const { country_Id, gslValue } = req.body;
    if (!country_Id || !gslValue) {
      return res.status(400).json({
        status: 400,
        title: "Bad Request",
        description: "All fields are required.",
      });
    }
    const countryExists = await db.country.findOne({
      where: { id: country_Id },
    });
    if (!countryExists) {
      return res.status(400).json({
        status: 404,
        title: "Not found",
        description: "Could not find the required country",
      });
    }

    if (!gslValues.includes(gslValue)) {
      return res.status(400).json({
        status: 404,
        title: "invalid GSL value",
        description: "gsl only accepts open queued or spoken",
      });
    }
    countryExists.gsl = gslValue;
    await countryExists.save();
    return res.status(200).json({
      status: 200,
      title: "GSL updated",
      country: countryExists,
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
