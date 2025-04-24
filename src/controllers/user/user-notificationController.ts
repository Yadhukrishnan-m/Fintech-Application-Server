import { Request, Response, NextFunction } from "express";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { redisClient } from "../../config/redis";
import { CustomError } from "../../utils/custom-error";
import { TYPES } from "../../config/inversify/inversify.types";
import { injectable, inject } from "inversify";

import { INotificationService } from "../../interfaces/services/notification.service.interface";
interface AuthenticatedRequest extends Request {
  userId: string;
}

@injectable()
export class UserNotificationController {
  constructor(
    @inject(TYPES.NotificationService)
    private _notificationService: INotificationService
  ) {}
  async getNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req as AuthenticatedRequest;
      const { page = 1,  } = req.query;

      const {notifications,totalPages} = await this._notificationService.getNotifications(
        userId,
      Number(page)
      );
      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.CREATED,
        notifications,
        totalPages,
        userId,
      });
    } catch (error) {
      next(error);
    }
  }

  async markUserNotificationsAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req as AuthenticatedRequest;

      const notifications =
        await this._notificationService.markUserNotificationsAsRead(userId);
      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }
  async totalUnreadNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req as AuthenticatedRequest;

      const totalNotifications =
        await this._notificationService.totalUnreadNotifications(userId);
      res.status(STATUS_CODES.CREATED).json({
        success: true,
        message: MESSAGES.CREATED,
        totalNotifications,
      });
    } catch (error) {
      next(error);
    }
  }
}
