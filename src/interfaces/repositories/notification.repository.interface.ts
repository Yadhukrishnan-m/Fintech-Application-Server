
import { IBaseRepository } from "./base.repository.interface";
import { INotification } from "../../models/notification.model";
import { IReadStatus } from "../../models/notification-read.modal";
export interface INotificationRepository extends IBaseRepository<INotification> {
  getUserNotifications(
    userId: string
  ): Promise<(INotification & { isRead: boolean })[]>;
  getUserNotificationsForRead(userId: string): Promise<INotification[]>;
  totalNotifications(userId: string): Promise<number>;
}
   