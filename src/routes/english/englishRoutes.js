import { Router } from "express";
import getEnglishQuestion from "../../controllers/english/getEnglish.controllers.js";
import checkAnsEnglish from "../../controllers/english/english.controller.js";

const router = Router()

router.get("/getEnglish",getEnglishQuestion)
router.post("/update",checkAnsEnglish);

export default router;
