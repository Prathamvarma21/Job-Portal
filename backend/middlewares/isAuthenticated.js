import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    try {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : "";
  const token = req.cookies.token || bearerToken;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(401).json({ 
        message: 'Invalid token.' ,
        success: false});
    }
    req.id = decode.userId;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
} 

export default isAuthenticated;
