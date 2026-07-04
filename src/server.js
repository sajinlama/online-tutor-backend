import express from "express";
import cors from "cors";
import connectDb from "./db/connect.db.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userlogin from "./routes/userlogin.routes.js";
import userRegister from "./routes/userRegister.routes.js";
import mathQuestion from "./routes/mathqestion.route.js";
import englishQuestion from "./routes/english.routes.js";
import scienceQuestion from "./routes/science.routes.js";
import getmathQuestion from "./routes/getmaths.route.js";
import updateScore from "./routes/updateScore.routes.js";
import updateScoreEng from "./routes/eglish/updateScore.routes.js";
import updateScoreScience from "./routes/science/updateScore.routes.js";
import getquestionScience from "./routes/getScinece.routes.js";
import getquestionEnglish from "./routes/getEnglish.routes.js";
import authMiddleware from "./middlewares/user.auth.js";
import verifyAuth from "./routes/verify.routes.js"
import totalScore from "./routes/totalScore/totalScore.routes.js"
import update from "./routes/updateUser.routes.js"
import updateName from "./routes/updateProfile.routes.js"

dotenv.config();

const app = express();
const router = express.Router();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true                
}));


app.use("/api/auth/verify", verifyAuth);

// Example of a protected route
router.get("/user/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    name: "User Name",
    email: req.user.email,
    id: req.user.userId
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Logged out successfully"
  });
});


app.get('/api/check-auth', authMiddleware, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user
  });
});



// Register all routes
app.use("/api", router); 
app.use("/api/register", userRegister);
app.use("/api/login", userlogin);
app.use("/api/maths", mathQuestion);
app.use("/api/science", scienceQuestion);
app.use("/api/english", englishQuestion);
app.use("/api/getmathQuestion", getmathQuestion);
app.use("/api/updateScore", updateScore);
app.use("/api/getScienceQuestion", getquestionScience);
app.use("/api/getEnglishQuestion", getquestionEnglish);
app.use("/api/getTotal",totalScore);
app.use("/api/updateScince",updateScoreScience);
app.use("/api/updateEng",updateScoreEng);
app.use("/api/users/change-password",update);
app.use("/api/users/update-profile",updateName);


// 404 handler
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "API route not found",
  });
});

const port = process.env.PORT || 5001;

app.listen(port, () => {
  connectDb()
    .then(() => {
      console.log("Database connected successfully!");
    })
    .catch((error) => {
      console.error(`Database connection error: ${error.message}`);
    });
    
  console.log(`Server running on http://localhost:${port}`);
});