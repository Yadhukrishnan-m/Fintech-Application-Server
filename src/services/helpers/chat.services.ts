import { injectable, inject } from "inversify";
import { IChatRepository } from "../../interfaces/repositories/chat.repository.interface";
import { IMessageRepository } from "../../interfaces/repositories/message.repository.interface";
import { IChat } from "../../models/chat.model";
import { IMessage } from "../../models/message.model";
import { STATES, Types } from "mongoose";
import { IChatService } from "../../interfaces/services/chat.service.interface";
import { TYPES } from "../../config/inversify/inversify.types";
import { CustomError } from "../../utils/custom-error";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(TYPES.ChatRepository)
    private _chatRepository: IChatRepository,
    @inject(TYPES.MessageRepository)
    private _messageRepository: IMessageRepository
  ) {}

  async getOrCreateChat(userId: string, adminId: string): Promise<IChat> {
    console.log(userId,adminId);
    
    let chat = await this._chatRepository.findOne({
      user_id: new Types.ObjectId(userId),
      admin_id: new Types.ObjectId(adminId),
    });


    if (!chat) {
      chat = await this._chatRepository.create({
        user_id: new Types.ObjectId(userId),
        admin_id: new Types.ObjectId(adminId),
      });
    }

    return chat;
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    senderModel: "User" | "Admin",
    content: string
  ): Promise<IMessage> {
    const message = await this._messageRepository.create({
      chat_id: new Types.ObjectId(chatId),
      sender_id: new Types.ObjectId(senderId),
      sender_model: senderModel,
      content,
    });
    console.log(chatId);

    await this._chatRepository.updateById(chatId, {
      last_message: content,
      last_message_at: new Date(),
    });

    return message;
  }

  async getAllChats(): Promise<
    (Partial<IChat> & { unread_messages: number })[]
  > {
    const chats = await this._chatRepository.allChatWithUserName();
    if (!chats) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const chatListWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await this._messageRepository.numberOfUnReaded(
          chat._id.toString()
        );

        return {
          _id: chat._id,
          user: chat.user_id,
          last_message: chat.last_message,
          last_message_at: chat.last_message_at,
          unread_messages: unreadCount,
        };
      })
    );

    return chatListWithUnreadCount;
  }

  async getMessages(chatId: string): Promise<IMessage[]> {
    const query = { chat_id: new Types.ObjectId(chatId) };

    return await this._messageRepository.find(query);
  }
}
