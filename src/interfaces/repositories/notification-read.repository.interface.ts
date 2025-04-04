
import { IBaseRepository } from "./base.repository.interface";
import { INotification } from "../../models/notification.model";
import { IReadStatus } from "../../models/notification-read.modal";
import mongoose from "mongoose";
export interface INotificationReadRepository extends IBaseRepository<IReadStatus> {
  createMissingReadDocuments(
    userId: string,
    notificationIds: mongoose.Types.ObjectId[]
  ): Promise<void>;
  markAllAsRead(
    userId: string,
    notificationIds: mongoose.Types.ObjectId[]
  ): Promise<void>;
  totalReaded(userId: string): Promise<number>;
}
   