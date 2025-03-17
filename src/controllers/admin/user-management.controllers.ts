import { Request, Response, NextFunction } from "express";
import { IUserManagementService } from "../../interfaces/services/user-management.service.interface";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
export class UserManagementController {
  constructor(private userManagementService: IUserManagementService) {}
  async getUnverifiedUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, search, sortBy, filter } = req.query;
   

      const users = await this.userManagementService.getUnverifiedUsers(
        Number(page),
        search as string,
        sortBy as string,
        filter as string
      );
     

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        users: users,
      });
    } catch (error) {
      next(error);
    }
  }
  async getUserById(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;

    const user = await this.userManagementService.getUserById(id);

    res
      .status(STATUS_CODES.OK)
      .json({ success: true, message:MESSAGES.DATA_SENT_SUCCESS, user });
  }

  async verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const { status } = req.body;

      const user = await this.userManagementService.verifyUser(id, status);

      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: MESSAGES.DATA_SENT_SUCCESS});
    } catch (error) {
      next(error);
    }
  }
  async blacklistUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const { action } = req.body;

      const user = await this.userManagementService.blacklistUser(id, action);

      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: MESSAGES.DATA_SENT_SUCCESS });
    } catch (error) {
      next(error);
    }
  }
  async getVerifiedUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, search, sortBy, filter } = req.query;
     

      const users = await this.userManagementService.getVerifiedUsers(
        Number(page),
        search as string,
        sortBy as string,
        filter as string
      );
    

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        users: users,
      });
    } catch (error) {
      next(error);
    }
  }
} 
