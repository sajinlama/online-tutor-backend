import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    console.log("this is middleware token",token)
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        authenticated: false,
        message: 'Authentication required. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      authenticated: false,
      message: 'Invalid or expired token.'
    });
  }
};

export default authMiddleware;