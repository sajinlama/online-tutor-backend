import express from "express"
import checkAnsScience from "../../controllers/Science/scienceCheck.contorller.js"
const router =express.Router();


router.post("/",checkAnsScience);

export default router;