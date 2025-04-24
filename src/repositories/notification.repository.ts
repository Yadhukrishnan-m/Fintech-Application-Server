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
  async getNotifications(
    userId: string,
    page: number,
    limit: number
  ): Promise<{
    notifications: (INotification & { isRead: boolean })[];
    totalPages: number;
  }> {
    const objectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const result = await NotificationModel.aggregate([
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
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          readStatus: 0,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          count: [{ $count: "total" }],
        },
      },
    ]);

    const notifications = result[0]?.data || [];
    const totalCount = result[0]?.count[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return { notifications, totalPages };
  }

  async getUserNotificationsForRead(userId: string): Promise<INotification[]> {
    const objectId = new mongoose.Types.ObjectId(userId);

    return await NotificationModel.find({
      $or: [{ type: "global" }, { userId: objectId }],
    }).select("_id");
  }
  async totalNotifications(userId: string): Promise<number> {
    const objectId = new mongoose.Types.ObjectId(userId);

    return await NotificationModel.countDocuments({
      $or: [{ type: "global" }, { userId: objectId }],
    });
  }
}
