import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { INotification, NotificationModel } from "../models/notification.model";
import mongoose from "mongoose";
import { INotificationReadRepository } from "../interfaces/repositories/notification-read.repository.interface";
import { IReadStatus, NotificationReadModel } from "../models/notification-read.modal";
@injectable()
export class NotificationReadRepository
  extends BaseRepository<IReadStatus>
  implements INotificationReadRepository
{
  constructor() {
    super(NotificationReadModel);
  }
  async createMissingReadDocuments(
    userId: string,
    notificationIds: mongoose.Types.ObjectId[]
  ): Promise<void> {
    const objectId = new mongoose.Types.ObjectId(userId);

    const existingReadStatus = await NotificationReadModel.find({
      userId: objectId,
      notificationId: { $in: notificationIds },
    }).select("notificationId");

    const existingReadIds = new Set(
      existingReadStatus.map((n) => n.notificationId.toString())
    );

    const newNotifications = notificationIds.filter(
      (id) => !existingReadIds.has(id.toString())
    );

    if (newNotifications.length > 0) {
      await NotificationReadModel.insertMany(
        newNotifications.map((id) => ({
          userId: objectId,
          notificationId: id,
          isRead: false,
          readAt: null,
        }))
      );
    }
  }

  async markAllAsRead(
    userId: string,
    notificationIds: mongoose.Types.ObjectId[]
  ): Promise<void> {
    await NotificationReadModel.updateMany(
      { userId, notificationId: { $in: notificationIds }, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
  }
  async totalReaded(
    userId: string,
  ): Promise<number> {
    const objectId = new mongoose.Types.ObjectId(userId);

    return await NotificationReadModel.countDocuments({
      userId: objectId,
      isRead: true,
    });
  }
}
