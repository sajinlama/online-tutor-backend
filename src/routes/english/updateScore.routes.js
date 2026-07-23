import express from "express"

import checkAnsEnglish from "../../controllers/english/english.controller.js";
const router =express.Router();


router.post("/",checkAnsEnglish);

export default router;