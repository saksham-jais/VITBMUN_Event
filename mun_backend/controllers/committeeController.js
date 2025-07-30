import db from "../config/db.js";
import { formatError } from "../utils/helper.js";

export const getCommitteeById = async (req, res) => {
  try {
    const id = 1;

    const committee = await db.committee.findOne({
      where: { id },
      include: [
        { model: db.motion, as: "motions" },
        { model: db.country, as: "countries" },
      ],
    });

    if (!committee) {
      return res.status(404).json(
        formatError({
          status: 404,
          title: "Not Found",
          description: "Committee not found",
        })
      );
    }

    return res.status(200).json({
      message: "Committee retrieved successfully",
      committee,
    });
  } catch (error) {
    console.error("Error fetching committee by ID:", error);
    return res.status(500).json(
      formatError({
        status: 500,
        title: "Internal Server Error",
        description: "An error occurred while fetching the committee details.",
      })
    );
  }
};

export const createCommittee = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json(
        formatError({
          status: 400,
          title: "Validation Error",
          description: "The 'name' field is required and cannot be empty.",
        })
      );
    }

    try {
      const newCommittee = await db.committee.create({ name: name.trim() });
      return res
        .status(201)
        .json({
          message: "Committee created successfully",
          committee: newCommittee,
        });
    } catch (e) {
      console.log("error: ", e);
      return res.status(400).json({
        message: "Committee is already present",
      });
    }
  } catch (error) {
    console.error("Error creating committee:", error);
    return res.status(500).json(
      formatError({
        status: 500,
        title: "Internal Server Error",
        description:
          "Could not create the committee due to a server error or name is not provided",
      })
    );
  }
};
