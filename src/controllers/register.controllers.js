import User from "../models/User.Models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
const userSchema = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(new RegExp("^(?=.*[a-zA-Z])(?=.*\\d).{8,20}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain at least one letter and one number.",
    }),
});

const register = async (req, res) => {
  try {
   
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const { name, email, password } = req.body;
    console.log(name);


    console.log("hello sajin i am here")
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: "Email already in use",
      });
    }

    // Hash password
    const roundSalt = 10;
    const salt = await bcrypt.genSalt(roundSalt);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashPassword,
    });

    await newUser.save();

   
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email }, // Payload
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "7d" } 
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
export default register;
