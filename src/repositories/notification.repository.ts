import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import { INotification, NotificationModel } from "../models/notification.model";
import { IReadStatus, NotificationReadModel } from "../models/notification-read.modal";
import { INotificationRepository } from "../interfaces/repositories/notification.repository.interface";
import mongoose from "mongoose";
@injectable()
export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(NotificationModel);
  }
  async getUserNotifications(
    userId: string
  ): Promise<(INotification & { isRead: boolean })[]> {
    const objectId = new mongoose.Types.ObjectId(userId);

    return await NotificationModel.aggregate([
      {
        $match: {
          $or: [{ type: "global" }, { userId: objectId }],
        },
      },
      {
        $lookup: {
          from: "notificationreads",
          let: { notificationId: "$_id", userId: objectId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$notificationId", "$$notificationId"] },
                    { $eq: ["$userId", "$$userId"] },
                  ],
                },
              },
            },
          ],
          as: "readStatus",
        },
      },
      {
        $addFields: {
          isRead: { $gt: [{ $size: "$readStatus" }, 0] },
        },
      },
      {
        $sort: { createdAt: -1 }, // Sorting: Latest notifications first
      },
      {
        $project: {
          readStatus: 0,
        },
      },
    ]);
  }

  async getUserNotificationsForRead(userId: string): Promise<INotification[]> {
    const objectId = new mongoose.Types.ObjectId(userId);

    return await NotificationModel.find({
      $or: [{ type: "global" }, { userId: objectId }],
    }).select("_id");
  }
  async totalNotifications(userId: string): Promise<number> {
        const objectId = new mongoose.Types.ObjectId(userId);
    
       return await NotificationModel.countDocuments(
          { userId: objectId });
  }
}
