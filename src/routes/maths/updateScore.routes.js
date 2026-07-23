import express from "express"
import checkAnsMaths from "../../controllers/maths/maths.controller.js";

const router =express.Router();


router.post("/",checkAnsMaths);

export default router;