// controllers/authController.js
import jwt from 'jsonwebtoken';

const verifyAuth = (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    console.log("this is verify token",token);
    
    // Check if token exigsts
    if (!token) {
      return res.status(200).json({
        authenticated: false,
        message: 'No token found'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Return success with user data
    return res.status(200).json({
      authenticated: true,
      user: {
        userId: decoded.userId,
        email: decoded.email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(200).json({
      authenticated: false,
      message: 'Invalid token'
    });
  }
};

export default verifyAuth;