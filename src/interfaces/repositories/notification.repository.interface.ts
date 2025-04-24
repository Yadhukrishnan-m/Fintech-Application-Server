
import { IBaseRepository } from "./base.repository.interface";
import { INotification } from "../../models/notification.model";
import { IReadStatus } from "../../models/notification-read.modal";
export interface INotificationRepository extends IBaseRepository<INotification> {
  getNotifications(
    userId: string,
    page: number,
    limit: number
  ): Promise<{
    notifications: (INotification & { isRead: boolean })[];
    totalPages: number;
  }>;
  getUserNotificationsForRead(userId: string): Promise<INotification[]>;
  totalNotifications(userId: string): Promise<number>;
}
   