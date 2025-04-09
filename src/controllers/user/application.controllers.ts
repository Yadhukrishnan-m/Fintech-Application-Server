import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../utils/custom-error";
import { Express } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";

import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { IApplicationService } from "../../interfaces/services/application.service.interface";
import { ApplicationDto } from "../../dtos/admin/applicationDTO";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
// import { ApplicationDto } from "../../dtos/admin/applicationDTO";
interface AuthenticatedRequest extends Request {
  userId: string;
}


@injectable()
export class ApplicationController {
  constructor(
    @inject(TYPES.ApplicationService)
    private _applicationService: IApplicationService,
    @inject(TYPES.UploadToS3) private _uploadToS3: IUploadToS3
  ) {}

  async createApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { loanId, amount, tenure, accountNumber, ifscCode } = req.body;
      

      const { userId } = req as AuthenticatedRequest;
      const applicationData: ApplicationDto = {
        loanId,
        amount,
        tenure,
        accountNumber,
        ifscCode,
        documents: req.files as Express.Multer.File[],
      };
      const result = await this._applicationService.createApplication(
        applicationData,
        userId
      );
      res
        .status(STATUS_CODES.CREATED)
        .json({ message: MESSAGES.CREATED, success: true });
    } catch (error) {
      next(error);
    }
  }
  async getApplicationsByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req as AuthenticatedRequest;
      const { page = 1 } = req.query;
      const applications =
        await this._applicationService.getApplicationsByUserId(
          userId,
          Number(page)
        );

      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.CREATED,
        success: true,
        applications: applications,
      });
    } catch (error) {
      next(error);
    }
  }


  async getApplicationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req as AuthenticatedRequest;
      const { applicationId } = req.params;

      const application = await this._applicationService.getApplicationDetails(
        userId,
        applicationId
      );

     

      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.CREATED,
        success: true,
        application: application,
      });
    } catch (error) {
      next(error);
    }
  }
}
