import express from "express"

import addScienceQuestion from "../../controllers/Science/addScienceQuestion.js";

const router = express.Router();

router.post("/",addScienceQuestion);

export default router;