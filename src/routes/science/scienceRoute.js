import { Router } from "express";
import checkAnsScience from "../../controllers/Science/science.controller.js";
import getScienceQestion from "../../controllers/Science/getScience.controller.js";

const router = Router()

router.post("/update",checkAnsScience)
router.get("/getScience",getScienceQestion)

export default router