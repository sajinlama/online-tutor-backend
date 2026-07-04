
import express from "express"
import userLogin from "../controllers/userLogin.controllers.js";

const router =express.Router();

router.post("/",userLogin);

export default router;