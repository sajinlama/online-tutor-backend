import express from "express"
import getScienceQestion from "../controllers/getScience.controller.js"


const router = express.Router();

router.get("/",getScienceQestion);

export default router;