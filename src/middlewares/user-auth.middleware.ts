import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId?: string;
}
const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {    
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
       res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
        return
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;
  
    
    req.userId = decoded._id._id ||decoded._id; 
    
    // console.log('userid is '+req.userId);
    
     
    
    next();
  } catch (error) {
     res
      .status(403)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

export { authenticateUser };
