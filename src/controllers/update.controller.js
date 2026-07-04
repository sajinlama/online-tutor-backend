import User from "../models/User.Models.js";
import bcrypt from "bcrypt";
import Joi from "joi";

// Validation schema for update profile
const updateProfileSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required.",
  }),
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long.",
    "string.max": "Name must not exceed 50 characters.",
    "any.required": "Name is required.",
  }),
});

// Validation schema for change password
const changePasswordSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required.",
  }),
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required.",
  }),
  newPassword: Joi.string().min(8).max(20).required().messages({
    "string.min": "New password must be at least 8 characters long.",
    "string.max": "New password must not exceed 20 characters.",
    "any.required": "New password is required.",
  }),
});

// Controller to update user profile
export const updateProfile = async (req, res) => {
  try {
    // Validate request data
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const { name, userId } = req.body;
    console.log("name:", name);
    console.log("userId:", userId);
    console.log("hello sajin");

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    // Send response
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      error: "An error occurred while updating your profile.",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    // Validate request data
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message,
      });
    }

    const { userId, currentPassword, newPassword } = req.body;
    console.log("userId:", userId);

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Send response
    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({
      error: "An error occurred while changing your password.",
    });
  }
};