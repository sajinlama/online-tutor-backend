import express from "express"
import addMathQuestion from "../../controllers/maths/addMathQuestion.js";

const router = express.Router();

router.post("/",addMathQuestion);

export default router;