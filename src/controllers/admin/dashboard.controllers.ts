import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/custom-error";
import { Express } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";

import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ICapitalAndTransactionService } from "../../interfaces/services/capital-transaction.service.interface";
import { IDashboardService } from "../../interfaces/services/dashboard.service.interface";
import path from "path";
import fs from "fs";
interface AuthenticatedRequest extends Request {
  userId: string;
}

@injectable()
export class DashboardController {
  constructor(
    @inject(TYPES.DashboardService)
    private _dashboardService: IDashboardService
  ) {}

  async getTotals(req: Request, res: Response, next: NextFunction) {
    try {
      const { totalAmount, totalLoans, approvalRate, userCount } =
        await this._dashboardService.getTotals();
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        totalAmount,
        totalLoans,
        approvalRate,
        userCount,
      });
    } catch (error) {
      next(error);
    }
  }

  async applicationChart(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeFrame } = req.params;
      const data = await this._dashboardService.applicationChart(timeFrame);

      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: MESSAGES.DATA_SENT_SUCCESS, data });
    } catch (error) {
      next(error);
    }
  }
  async transactionChart(req: Request, res: Response, next: NextFunction) {
    try {
      const { timeFrame } = req.params;
      const data = await this._dashboardService.transactionChart(timeFrame);

      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: MESSAGES.DATA_SENT_SUCCESS, data });
    } catch (error) {
      next(error);
    }
  }

  async downloadReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentType } = req.params;
      const {startDate,endDate}=req.body

      const pdfStream = await this._dashboardService.DownloadReport(
        documentType,
        startDate,
        endDate
      );
      // const fileName = path.basename(filePath);
      // console.log("📥 Downloading file:", pdfStream);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="document.pdf"'
      );

      // Pipe the stream to the response
      pdfStream.pipe(res);

      // Handle stream finish
      pdfStream.on("end", () => {
        console.log("PDF stream finished.");
      });

      // Handle stream errors
      pdfStream.on("error", () => {
        console.error("Error streaming PDF:");
        res.sendStatus(500);
      });

  
    } catch (error) {
      console.error("❌ Unexpected error during download:", error);
      next(error);
    }
  }
}

 