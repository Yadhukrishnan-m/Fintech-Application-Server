import { Request, Response, NextFunction } from "express";
import { IProfileService } from "../../interfaces/services/user-profile.service.interface";
import { CustomError } from "../../utils/custom-error";
import { Express } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";

import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { IAdminTransactionService } from "../../interfaces/services/admin-transaction.service.interface";
interface AuthenticatedRequest extends Request {
  userId: string;
}

@injectable()
export class TransactionController {
  constructor(
     @inject(TYPES.AdminTransactionService)
        private _transactionService: IAdminTransactionService
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
