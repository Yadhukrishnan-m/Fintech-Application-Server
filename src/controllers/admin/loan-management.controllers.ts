import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { CustomError } from "../../utils/custom-error";
import { TYPES } from "../../config/inversify/inversify.types";
import { injectable, inject } from "inversify";
import { IUserManagementService } from "../../interfaces/services/user-management.service.interface";
import { LoanDTO } from "../../dtos/admin/loanDto";
import { ILoanManagementService } from "../../interfaces/services/loan-management.service.interface";
@injectable()
export class LoanManagementController {
  constructor(
    @inject(TYPES.LoanManagementService)
    private _loanManagementService: ILoanManagementService
  ) {}
  async createLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const loanData: LoanDTO = {
        ...req.body,
        additionalDocuments: req.body.additionalDocuments
          ? JSON.parse(req.body.additionalDocuments)
          : [], 
        loanImage: req.file,
      };
      await this._loanManagementService.createLoan(loanData);
      res
        .status(STATUS_CODES.CREATED)
        .json({ message: "Loan created successfully", success: true });
    } catch (error) {
      next(error);
    }
  }
  async getLoans(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, search, sortBy, isActive } = req.query;
      const pageNumber = Number(page);
      const activeStatus =
        isActive === "true" ? true : isActive === "false" ? false : undefined;

      const { loans, totalPages } = await this._loanManagementService.getLoans(
        pageNumber,
        search as string,
        sortBy as string,
        activeStatus
      );

      res.status(STATUS_CODES.OK).json({ loans, totalPages });
    } catch (error) {
      next(error);
    }
  }
  async toggleLoanStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { loanId } = req.params;

      const updatedLoan =
        await this._loanManagementService.toggleLoanActivation(loanId);

      res.status(STATUS_CODES.OK).json({
        message: "Loan status updated successfully",
        loan: updatedLoan,
      });
    } catch (error) {
      next(error);
    }
  }
  async getLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const { loanId } = req.params;
      const loan = await this._loanManagementService.getLoan(loanId);
 
      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.DATA_SENT_SUCCESS,
        loan,
        success:true
      });
    } catch (error) {
      next(error);
    }
  }
  async updateLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const { loanId } = req.params;

      const loanData: LoanDTO = {
        ...req.body,
        additionalDocuments: req.body.additionalDocuments
          ? JSON.parse(req.body.additionalDocuments)
          : [],
        loanImage: req.file,
      };

      const loan = await this._loanManagementService.updateLoan(
        loanId,
        loanData
      );

      res.status(STATUS_CODES.OK).json({
        message: MESSAGES.DATA_SENT_SUCCESS,
        loan,
        success:true
      });
    } catch (error) {
      next(error);
    }
  }
}
