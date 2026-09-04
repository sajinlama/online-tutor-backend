import { Router } from "express"
import authRoutes from "./auth/authroutes"
import englishRoutes from "./english/englishRoutes"
import scienceRoutes from "./science/scienceRoute"
import mathRoutes from "./maths/mathsRoutes"
import userProfileRoutes from "./users/profileRoutes"
import totoalRoutes from "./totalScore/totalScore.routes"
import authMiddleware from "../middlewares/user.auth"

const router = Router()

router.use("/auth/",authRoutes)
router.use("/english",authMiddleware,englishRoutes)
router.use("/science",authMiddleware,scienceRoutes)
router.use("/maths",authMiddleware,mathRoutes)
router.use("/profile",authMiddleware,userProfileRoutes)
router.use("/score",authMiddleware,totoalRoutes)


export  default router