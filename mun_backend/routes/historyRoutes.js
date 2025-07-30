import db from "../config/db.js";
import express from "express";

const historyRouter = express.Router();

historyRouter.get("/", async (req, res) => {
    try{
        const votingHistory = await db.votingHistory.findAll();
        return res.status(200).json({
            message: "Voting history retrieved successfully",
            votingHistory,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error retrieving voting history",
            error: error.message,
        });
    }
});

historyRouter.post("/add", async (req, res) => {
    try {
        const data = req.body.data;
        const newVote = await db.votingHistory.create({history:data});
        return res.status(201).json({
            message: "Vote added successfully",
            newVote,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error adding vote",
            error: error.message,
        });
    }
});

export default historyRouter;