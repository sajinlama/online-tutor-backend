import express from "express"
import addMathQuestion from "../controllers/maths.controller.js";

const router = express.Router();

router.post("/",addMathQuestion);

export default router;