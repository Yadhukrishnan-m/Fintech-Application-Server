import { Request, Response, NextFunction } from "express";
import { IProfileService } from "../../interfaces/services/user-profile.service.interface";
import { CustomError } from "../../utils/custom-error";
import { Express } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";

import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ILoanService } from "../../interfaces/services/loan.service.interface";
import { IUserLoanService } from "../../interfaces/services/user-loan.interface.interfaces";
interface AuthenticatedRequest extends Request {
  userId: string;
}


@injectable()
export class UserLoanController {
  constructor(
    @inject(TYPES.UserLoanService) private _userLoanService: IUserLoanService
  ) {}

  async getUserLoansByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req as AuthenticatedRequest;
      const { page = 1 } = req.query;
      const userLoans = await this._userLoanService.getUserLoanByUserId(
        userId,
        Number(page)
      );

      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.CREATED,
        success: true,
        userLoans: userLoans,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserLoanEmis(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req as AuthenticatedRequest;
      
     const { userLoanId }=req.params
      const { emiSchedule, userLoan } = await this._userLoanService.getEmis(
        userLoanId,
        userId
      );

      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.CREATED,
        success: true,
        emi: emiSchedule,
        userLoan: userLoan,
      });
    } catch (error) {
      next(error);
    }
  }
}
