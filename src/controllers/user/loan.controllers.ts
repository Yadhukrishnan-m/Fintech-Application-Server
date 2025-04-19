import { Request, Response, NextFunction } from "express";
import { IProfileService } from "../../interfaces/services/user-profile.service.interface";
import { CustomError } from "../../utils/custom-error";
import { Express } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";

import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ILoanService } from "../../interfaces/services/loan.service.interface";
interface AuthenticatedRequest extends Request {
  userId: string;
}


@injectable()
export class LoanController {
  constructor(@inject(TYPES.LoanService) private _loanService: ILoanService) {}

  async getLoans(req: Request, res: Response, next: NextFunction) {
    try {
        const { page = 1, search, sortBy } = req.query;
        const pageNumber = Number(page);
         const { loans, totalPages } = await this._loanService.getLoans(
           pageNumber,
           search as string,
           sortBy as string,
         );
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        loans: loans,
        totalPages
      });
    } catch (error) {
      next(error);
    }
  }
  async getLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const loan = await this._loanService.getLoan(id);
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        loan: loan,
      });
    } catch (error) {
      next(error);
    }
  }
  async getInterest(req: Request, res: Response, next: NextFunction) {
    try {
      const { loanId } = req.params;
      const { userId } = req as AuthenticatedRequest;
      
      
      
      const interest = await this._loanService.getInterest(userId, loanId);
      
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        interest: interest,
      });
    } catch (error) {
      next(error);
    }
  }

  
}
