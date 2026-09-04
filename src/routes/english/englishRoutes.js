import { Router } from "express";
import getEnglishQuestion from "../../controllers/english/getEnglish.controllers";
import checkAnsEnglish from "../../controllers/english/english.controller";

const router = Router()

router.get("/",getEnglishQuestion)
router.post("/",checkAnsEnglish);

export default router;
