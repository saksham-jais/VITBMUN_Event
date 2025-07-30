import express from "express";
import { getGslStatus, gslEdit } from "../controllers/gslController.js";

const gslRouter = express.Router();

gslRouter.get("/",async(req,res)=>{
    await getGslStatus(req,res);
})

gslRouter.post("/update", async(req,res)=>{
    await gslEdit(req,res);
})

export default gslRouter;
