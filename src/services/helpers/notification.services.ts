
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { INotificationService } from "../../interfaces/services/notification.service.interface";
import { INotificationRepository } from "../../interfaces/repositories/notification.repository.interface";
import { ObjectId } from "bson";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { CustomError } from "../../utils/custom-error";
import { IUser } from "../../models/user.model";
import { INotification } from "../../models/notification.model";
import { getIO, getUserSocket, userSocketMap } from "../../config/socket";
import { error } from "console";
import { IReadStatus } from "../../models/notification-read.modal";
import mongoose from "mongoose";
import { INotificationReadRepository } from "../../interfaces/repositories/notification-read.repository.interface";
@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private _notificationRepository: INotificationRepository,
    @inject(TYPES.UserRepository)
    private _userRepository: IUserRepository,
    @inject(TYPES.NotificationReadRepository)
    private _notificationReadRepository: INotificationReadRepository
  ) {}

  async createNotification(
    title: string,
    message: string,
    type: "global" | "personal",
    userId: string | null
  ): Promise<void> {
    const userMongoseId: IUser | null = userId
      ? await this._userRepository.findOne({ customerId: userId })
      : null;

    if (type === "personal" && !userMongoseId) {
      throw new CustomError("User Not Found", STATUS_CODES.NOT_FOUND);
    }

    const notification = {
      title,
      message,
      userId: type === "global" ? undefined : userMongoseId?._id,
      type,
    };

    await this._notificationRepository.create(notification);

    const io = getIO();
    console.log("All Socket Mappings:", Array.from(userSocketMap.entries()));

    if (userMongoseId?._id) {
      const userSocketId = getUserSocket(userMongoseId._id.toString());
      console.log(userSocketId);

      if (userSocketId) {
        io.to(userSocketId).emit("new_notification", notification);
      }
    } else {
      io.emit("new_notification", notification);
    }
  }

  async getNotifications(
    userId: string,
    page: number
  ): Promise<{
    notifications: (INotification & { isRead: boolean })[];
    totalPages: number;
  }> {
     const pageSize = 10; 
     const skip = (page - 1) * pageSize;
     
    return await this._notificationRepository.getNotifications(
      userId,
      skip,
     pageSize
    );
  }

  async markUserNotificationsAsRead(userId: string): Promise<void> {
    const objectId = new mongoose.Types.ObjectId(userId);

    const allNotifications =
      await this._notificationRepository.getUserNotificationsForRead(userId);

    if (allNotifications.length === 0) return;

    const notificationIds = allNotifications
      .map((n) => n._id)
      .filter(
        (id): id is mongoose.Types.ObjectId =>
          id instanceof mongoose.Types.ObjectId
      );

    await this._notificationReadRepository.createMissingReadDocuments(
      userId,
      notificationIds
    );

    await this._notificationReadRepository.markAllAsRead(
      userId,
      notificationIds
    );
  }

  async totalUnreadNotifications(userId: string): Promise<number> {
    const totalreaded = await this._notificationReadRepository.totalReaded(
      userId
    );
    const total = await this._notificationRepository.totalNotifications(userId);
    return total - totalreaded;
  }
}
