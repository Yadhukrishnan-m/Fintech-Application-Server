import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import ChatModel, { IChat } from "../models/chat.model";
import { IChatRepository } from "../interfaces/repositories/chat.repository.interface";

@injectable()
export class ChatRepository
  extends BaseRepository<IChat>
  implements IChatRepository
{
  constructor() {
    super(ChatModel);
  }

  async findByUserId(userId: string): Promise<IChat | null> {
    return await ChatModel.findOne({ user_id: userId }).lean();
  }

  async updateLastMessage(chatId: string, content: string): Promise<null> {
    return await ChatModel.findByIdAndUpdate(chatId, {
      last_message: content,
      last_message_at: new Date(),
    });
  }
  async allChatWithUserName(): Promise<IChat[] | null> {
    return await ChatModel.find()
      .populate("user_id", "name")
      .sort({ updatedAt: -1 });
  }


}
