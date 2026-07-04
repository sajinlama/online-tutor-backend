// Import necessary modules
import User from "../models/User.Models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format.",
    "any.required": "Email is required.",
  }),
  password: Joi.string().min(8).max(20).required().messages({
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password must not exceed 20 characters.",
    "any.required": "Password is required.",
  }),
});

const userLogin = async (req, res) => {
  try {
    // Validate request data
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }
    
    const { email, password } = req.body;
    console.log(email, password);
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("user not found");
      return res.status(404).json({
        error: "User not found. Please sign up.",
      });
    }
    
    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(user.password);
    if (!isPasswordValid) {
      console.log("password not found");
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    // Send response with userId and username
    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      username: user.name,
      email:user.email
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export default userLogin;