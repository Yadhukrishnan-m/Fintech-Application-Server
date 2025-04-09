import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";
import { IAdmin } from "./admin.model";

export interface IMessage extends Document {
  chat_id: mongoose.Types.ObjectId;
  sender_id: mongoose.Types.ObjectId;
  sender_model: "User" | "Admin";
  content: string;
  isread: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(  
  {
    chat_id: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender_id: { type: Schema.Types.ObjectId, required: true },
    sender_model: { type: String, enum: ["User", "Admin"], required: true },
    content: { type: String, required: true },
    isread: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", MessageSchema);
