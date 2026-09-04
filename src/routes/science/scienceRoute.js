import { Router } from "express";
import checkAnsScience from "../../controllers/Science/science.controller";
import getScienceQestion from "../../controllers/Science/getScience.controller";

const router = Router()

router.post("/update",checkAnsScience)
router.get("/getQuestion",getScienceQestion)

export default router