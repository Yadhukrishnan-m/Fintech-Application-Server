import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/custom-error";

export class ErrorHandler {
  public static handleError(
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (!err.statusCode) {
      console.log(err);
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
}
