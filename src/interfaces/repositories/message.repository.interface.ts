import { IBaseRepository } from "./base.repository.interface";
import { IMessage } from "../../models/message.model";
export interface IMessageRepository extends IBaseRepository<IMessage> {
  numberOfUnReaded(chat_id: string): Promise<number>;
}
   