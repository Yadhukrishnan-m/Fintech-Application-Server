    import mongoose, { Schema, Document } from "mongoose";

    export interface IChat extends Document {
        _id:mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    admin_id: mongoose.Types.ObjectId;
    last_message?: string;
    last_message_at?: Date;
    createdAt: Date;
    updatedAt: Date;
    }

    const ChatSchema: Schema<IChat> = new Schema( // Converstion Id
      {
        user_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        admin_id: {
          type: Schema.Types.ObjectId,
          ref: "Admin",
          required: true,
        },
        last_message: {
          type: String,
        },
        last_message_at: {
          type: Date,
        },
      },
      {
        timestamps: true,
      }
    );

   const ChatModel= mongoose.model<IChat>("Chat", ChatSchema);
export default ChatModel