import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { IChatService } from "../../interfaces/services/chat.service.interface";
import { CustomError } from "../../utils/custom-error";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { IAuthAdminService } from "../../interfaces/services/auth-admin.service.interface";
import { IAdminRepository } from "../../interfaces/repositories/admin.repository.interface";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

@injectable()
export class UserChatController {
  constructor(
    @inject(TYPES.ChatService)
    private _chatService: IChatService,
    @inject(TYPES.AdminRepository) private _adminrepository: IAdminRepository
  ) {}

  // GET or create chat with admin
  async getOrCreateChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req as AuthenticatedRequest;

      const admin = await this._adminrepository.findOne({});
      if (!admin) {
        throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }
      const adminId = admin._id;
      if (userId == undefined) {
        throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }

      const chat = await this._chatService.getOrCreateChat(userId, adminId);
      const messages = await this._chatService.getMessages(chat._id.toString());

      res.status(STATUS_CODES.OK).json({
        success: true,
        chat: chat,
        messages,
      });
    } catch (error) {
      next(error);
    }
  }

  // Send message from user
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req as AuthenticatedRequest;
      const { chat_id, content } = req.body;
      if (userId == undefined) {
        throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
      }

      const messages = await this._chatService.sendMessage(
        chat_id,
        userId,
        "User",
        content
      );

      res.status(STATUS_CODES.CREATED).json({
        success: true,
        messages,
      });
    } catch (error) {
      next(error);
    }
  }

 

  // Get messages of a chat
  async getMessages(req: Request, res: Response) {
    const { chatId } = req.params;

    const messages = await this._chatService.getMessages(chatId);
    res.status(200).json(messages);
  }
}
