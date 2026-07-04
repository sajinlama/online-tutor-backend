import express from "express"

import checkAns from "../../controllers/english/englishScore.controller.js";

const router =express.Router();


router.post("/",checkAns);

export default router;