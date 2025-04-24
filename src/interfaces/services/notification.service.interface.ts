import { INotification } from "../../models/notification.model";


export interface INotificationService {
  createNotification(
    title: string,
    message: string,
    type: "global" | "personal",
    userId: string | null
  ): Promise<void>;
  getNotifications(
    userId: string,page:number
  ): Promise<{
    notifications: (INotification & { isRead: boolean })[];
    totalPages: number;
  } >;
  markUserNotificationsAsRead(userId: string): Promise<void>;
  totalUnreadNotifications(userId: string): Promise<number>;
}
