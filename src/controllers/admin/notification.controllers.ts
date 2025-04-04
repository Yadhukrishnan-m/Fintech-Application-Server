import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { redisClient } from "../../config/redis";
import { CustomError } from "../../utils/custom-error";
import { TYPES } from "../../config/inversify/inversify.types";
import { injectable, inject } from "inversify";

import { IUserLoanManagementService } from "../../interfaces/services/user-loan-management.services.interface";
import { INotificationService } from "../../interfaces/services/notification.service.interface";
@injectable()
export class NotificationController {
  constructor(
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService
  ) {}
  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
     const {title,message,type,userId}=req.body
     await this._notificationService.createNotification(
       title,
       message,
       type,
       userId
     );

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.CREATED,
       
      });
    } catch (error) {
      next(error);
    }
  }

}
