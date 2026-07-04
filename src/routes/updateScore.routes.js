import express from "express"
import checkAns from "../controllers/scoreCheck.controllers.js";

const router =express.Router();


router.post("/",checkAns);

export default router;