import express from "express"
import getMathsQuestion from "../../controllers/maths/getmathsQuestions.controller.js";


const router = express.Router();

router.get("/",getMathsQuestion);

export default router;