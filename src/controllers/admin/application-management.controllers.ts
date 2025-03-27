import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { redisClient } from "../../config/redis";
import { CustomError } from "../../utils/custom-error";
import { TYPES } from "../../config/inversify/inversify.types";
import { injectable, inject } from "inversify";
import { IApplicationManagementService } from "../../interfaces/services/application-management.services.interface";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { verifyApplicationDTO } from "../../dtos/admin/applicationDTO";
@injectable()
export class ApplicationManagementController {
  constructor(
    @inject(TYPES.ApplicationManagementService)
    private _applicationManagementService: IApplicationManagementService,
    @inject(TYPES.UploadToS3) private _uploadToS3: IUploadToS3
  ) {}
  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, search, sortBy, filter } = req.query;

      const applications =
        await this._applicationManagementService.getApplications(
          Number(page),
          search as string,
          sortBy as string,
          filter as string
        );

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        applications: applications,
      });
    } catch (error) {
      next(error);
    }
  }
  async getApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const application =
        await this._applicationManagementService.getApplication(applicationId);
      const expiresIn = 300;

      for (const document of application.documents) {
        const key = Object.keys(document)[0];
        document[key] = await this._uploadToS3.getSignedUrl(
          document[key],
          expiresIn
        );
      }

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        application: application,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { applicationId } = req.params;
      const statusAndMessage:verifyApplicationDTO=req.body
     
        await this._applicationManagementService.verifyApplication(
          applicationId,
          statusAndMessage
        );
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }
} 
