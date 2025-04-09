import { IBaseRepository } from "./base.repository.interface";
import { IChat } from "../../models/chat.model"; 
export interface IChatRepository extends IBaseRepository<IChat> {
  findByUserId(userId: string): Promise<IChat | null>;
  updateLastMessage(chatId: string, content: string):Promise <null>
   allChatWithUserName(): Promise<IChat[] | null> 
}
   