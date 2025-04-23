
import { MESSAGES } from "../config/constants/messages";
import { STATUS_CODES } from "../config/constants/status-code";
import { NextFunction, Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  userId?: string;
  role:string;
}
export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest);

    if (!user || !allowedRoles.includes(user.role)) {
      console.log("role not allowed");
      res.status(STATUS_CODES.FORBIDDEN).json({
        message: MESSAGES.BAD_REQUEST,
        userRole: user ? user.role : "None",
      });
      return;
    }
    next();
  };
};
