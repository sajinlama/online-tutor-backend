import express from "express";
import cors from "cors";
import connectDb from "./db/connect.db.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import router from "./routes/index.js";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

app.get("/", (req, res) => {
    res.json({
        message: "Online Tutor Backend is running"
    });
});
// All API routes
app.use("/api/v1", router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
  });
});

const port = process.env.PORT || 3002;

connectDb()
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((error) => {
    console.error(`Database connection error: ${error.message}`);
  });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});