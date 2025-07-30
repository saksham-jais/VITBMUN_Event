import express from "express";
import db from "../config/db.js";
const votingRouter = express.Router();  


votingRouter.get("/", async (req, res) => {
   try{
    const countries = await db.country.findAll({
        where: {    
            attendance: "Present and Voting",
        },
        attributes: ["id", "name"],
    })
    if(countries.length === 0) {
        return res.status(404).json({
            status: 404,
            title: "No countries found",
            description: "No countries are present and voting at the moment.",
        });
    }
    return res.status(200).json({
        message: "Countries that are present and voting",
        countries,
    });
   }catch (error) {
    console.error("Error fetching countries:", error);
    return res.status(500).json({
      status: 500,
      title: "Internal Server Error",
      description: "An error occurred while retrieving countries.",
    });
   }
    
})


export default votingRouter;
