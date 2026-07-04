import express from "express"

import addEnglishQuestion from "../controllers/english.controller.js";

const router = express.Router();

router.post("/",addEnglishQuestion);

export default router;