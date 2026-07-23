import express from "express"
import checkAnsScience from "../../controllers/Science/science.controller.js";
const router =express.Router();


router.post("/",checkAnsScience);

export default router;