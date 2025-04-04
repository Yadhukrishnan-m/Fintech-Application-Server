import mongoose, { Document, Schema } from "mongoose";

export interface IReadStatus extends Document {
  userId: mongoose.Types.ObjectId;
  notificationId: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
}

const NotificationReadSchema = new Schema<IReadStatus>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
    },
    isRead: { type: Boolean, },
    readAt: { type: Date },
  },
  { timestamps: true }
);

export const NotificationReadModel = mongoose.model<IReadStatus>(
  "NotificationRead",
  NotificationReadSchema
);
