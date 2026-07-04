import express from "express"
import getEnglishQuestion from "../controllers/getEnglish.controllers.js"


const router = express.Router();

router.get("/",getEnglishQuestion);

export default router;