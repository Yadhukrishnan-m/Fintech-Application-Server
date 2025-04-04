import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { redisClient } from "../../config/redis";
import { CustomError } from "../../utils/custom-error";
import { TYPES } from "../../config/inversify/inversify.types";
import { injectable, inject } from "inversify";

import { IUserLoanManagementService } from "../../interfaces/services/user-loan-management.services.interface";
@injectable()
export class UserLoanManagementController {
  constructor(
    @inject(TYPES.UserLoanManagementService)
    private _userLoanManagementService: IUserLoanManagementService
  ) {}
  async getUserLoans(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, search, sortBy, filter } = req.query;

      console.log(search);
      const { userLoans, totalPages } =
        await this._userLoanManagementService.getUserLoans(
          Number(page),
          search as string,
          sortBy as string,
          filter as string
        );

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        userLoans: userLoans,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserLoanEmis(req: Request, res: Response, next: NextFunction) {
    try {
      const { userLoanId } = req.params;
      const { emiSchedule, userLoan } =
        await this._userLoanManagementService.getEmis(userLoanId);

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

  async getUserLoansOfSingleUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.params;

      const userLoans  = await this._userLoanManagementService.getUserLoansOfSingleUser(userId);

      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.CREATED,
        success: true,
        userLoans,
      });
    } catch (error) {
      next(error);
    }
  }
}
