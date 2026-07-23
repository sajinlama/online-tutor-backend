
import express from "express"
import userlogin from "./../../controllers/users/userLogin.controllers.js"

const router =express.Router();

router.post("/",userlogin);

export default router;