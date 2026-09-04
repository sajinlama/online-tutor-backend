import { Router } from "express";
import getMathsQuestion from "../../controllers/maths/getmathsQuestions.controller";
import checkAnsMaths from "../../controllers/maths/maths.controller";

const router = Router();

router.get("/getMaths",getMathsQuestion)
router.post("/update",checkAnsMaths)

export default router;
