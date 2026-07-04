import express from "express"
import getTotalScore from "../../controllers/totalscore/getTotalScore.js";

import authMiddleware from "../../middlewares/user.auth.js";


const router = express.Router();

router.get("/", authMiddleware ,getTotalScore);

export default router;