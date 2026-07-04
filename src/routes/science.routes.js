import express from "express"

import addScienceQuestion from "../controllers/science.controllers.js";

const router = express.Router();

router.post("/",addScienceQuestion);

export default router;