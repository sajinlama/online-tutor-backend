import express from "express"
import getTotalScore from "../../controllers/totalscore/getTotalScore.js";



const router = express.Router();

router.get("/getTotal" ,getTotalScore);

export default router;