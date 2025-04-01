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
import { IPaymentService } from "../../interfaces/services/payment.service.interface";
import { ITransactionService } from "../../interfaces/services/transaction.service.interface";
interface AuthenticatedRequest extends Request {
  userId: string;
}

@injectable()
export class AdminTransactionController {
  constructor(
     @inject(TYPES.TransactionService)
        private _transactionService: ITransactionService
  ) {}
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {   
        const { userId } = req as AuthenticatedRequest;
        const { page, search, sortBy, statusFilter, typeFilter } = req.query;
         const pageNumber = Number(page);

          const { transactions, totalPages } =
            await this._transactionService.getTransactions(
              pageNumber,
              search as string,
              sortBy as string,
              statusFilter as string,
              typeFilter as string,
              userId
            );

                res.status(STATUS_CODES.OK).json({
                  success: true,
                  message: MESSAGES.DATA_SENT_SUCCESS,
                  transactions,
                  totalPages
                });

    } catch (error) {
      next(error);
    }
  }
}
