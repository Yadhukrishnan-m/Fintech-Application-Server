import { IChat } from "../../models/chat.model";
import { IMessage } from "../../models/message.model";

export interface IChatService {
  getOrCreateChat(userId: string, adminId: string): Promise<IChat>;
  sendMessage(
    chatId: string,
    senderId: string,
    senderModel: "User" | "Admin",
    content: string
  ): Promise<IMessage>;
  getMessages(chatId: string): Promise<IMessage[]>;

  getAllChats(): Promise<(Partial<IChat> & { unread_messages: number })[]>;
}
