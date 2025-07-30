import db from "../config/db.js";
import { motionTypes } from "../models/motion.js";
import { v4 } from "uuid";
import { generateCode } from "../utils/helper.js";
export const getAllMotions = async (req, res) => {
  try {
    const motions = await db.motion.findAll({
      include: ["country"],
    });
    if (motions == [] || motions.length == 0) {
      return res.status(404).json({
        status: 404,
        title: "Not Found",
        description: "No motions found in the database.",
      });
    }
    return res.status(200).json({
      message: "Motions retrieved successfully",
      motions,
    });
  } catch (error) {
    console.error("Error fetching motions:", error);
    return res.status(500).json({
      status: 500,
      title: "Internal Server Error",
      description: "An error occurred while fetching the motions.",
    });
  }
};

export const createMotion = async (req, res) => {
  try {
    const {
      topic,
      type,
      totalDuration,
      speakingTime,
      otherDescription,
      countryId,
    } = req.body;
    if (!topic || !type || !totalDuration || !speakingTime || !countryId) {
      return res.status(400).json({
        status: 400,
        title: "Bad Request",
        description: "All fields are required.",
      });
    }
    if (!motionTypes.includes(type)) {
      return res.status(400).json({
        status: 400,
        title: "Bad Request",
        description: `Invalid motion type. Allowed types are: ${motionTypes.join(
          ", "
        )}`,
      });
    }
    if (type == "other" && !otherDescription) {
      return res.status(400).json({
        status: 400,
        title: "Bad Request",
        description: "Other description is required for motion type 'other'.",
      });
    }
    const countryExists = await db.country.findOne({
      where: { id: countryId },
    });
    if (!countryExists) {
      return res.status(404).json({
        status: 404,
        title: "Not Found",
        description: "The country specified by 'raisedBy' does not exist.",
      });
    }
    const committeeId = 1;
    const newMotion = await db.motion.create({
      id: generateCode("MOT"),
      topic: topic.trim(),
      type,
      totalDuration,
      speakingTime,
      otherDescription: otherDescription ? otherDescription.trim() : null,
      countryId,
      committeeId,
    });
    return res.status(201).json({
      status: 201,
      title: "Created",
      description: "Motion created successfully.",
      motion: newMotion,
    });
  } catch (e) {
    console.error("Error creating motion:", e);
    return res.status(500).json({
      status: 500,
      title: "Internal Server Error",
      description: "An error occurred while creating the motion.",
    });
  }
};
