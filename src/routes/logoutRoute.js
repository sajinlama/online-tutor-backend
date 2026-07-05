import express from "express"
import logout from "../controllers/logoutController";

const router = express.Router();


app.post("/", logout);

export default router;