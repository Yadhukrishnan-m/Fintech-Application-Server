import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import MessageModel, { IMessage } from "../models/message.model";
import { IMessageRepository } from "../interfaces/repositories/message.repository.interface";

@injectable()
export class MessageRepository
  extends BaseRepository<IMessage>
  implements IMessageRepository
{
  constructor() {
    super(MessageModel);
  }

  async getMessagesByChatId(chatId: string): Promise<IMessage[]> {
    return await MessageModel.find({ chat_id: chatId })
      .sort({ createdAt: 1 })
      .lean();
  }

  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    console.log("data in repository", data);
    
    return await MessageModel.create(data);
  }
  async numberOfUnReaded(chat_id:string): Promise< number> {
    return await MessageModel.countDocuments({
      chat_id: chat_id,
      sender_model: "User",
      isread: false,
    });
  }
}
