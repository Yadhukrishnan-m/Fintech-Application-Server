import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/custom-error";
import { Express } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";

import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ICapitalAndTransactionService } from "../../interfaces/services/capital-transaction.service.interface";
interface AuthenticatedRequest extends Request {
  userId: string;
}

@injectable()
export class CapitalAndTransactionController {
  constructor(
    @inject(TYPES.CapitalAndTransactionService)
    private _capitalAndTransactionService: ICapitalAndTransactionService
  ) {}
  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, search, sortBy, statusFilter, typeFilter } = req.query;
      const pageNumber = Number(page);

      const { transactions, totalPages } =
        await this._capitalAndTransactionService.getTransactions(
          pageNumber,
          search as string,
          sortBy as string,
          statusFilter as string,
          typeFilter as string
        );

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        transactions,
        totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async addCapital(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount } = req.body;

      await this._capitalAndTransactionService.addCapital(Number(amount));

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  async getcapital(req: Request, res: Response, next: NextFunction) {
    try {
      const capital=await this._capitalAndTransactionService.getCapital()

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.CREATED,
        capital,
      });
    } catch (error) {
      next(error);
    }
  }
}
