import { Request, Response, NextFunction } from "express";
import { IProfileService } from "../../interfaces/services/user-profile.service.interface";
import { CustomError } from "../../utils/custom-error";
import { Express } from "express";
import { ProfileCompletionDto } from "../../dtos/user/auth/profile-completion.dto";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";

import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
interface AuthenticatedRequest extends Request {
  userId?: string;
}


@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.ProfileService) private _profileService: IProfileService
  ) {}

  async getUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req as AuthenticatedRequest;

      if (!userId) {
        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.UNAUTHORIZED
        );
      }
      const userData = await this._profileService.getUser(userId);

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.DATA_SENT_SUCCESS,
        user: userData,
      });
    } catch (error) {
      next(error);
    }
  }
  async completeProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req as AuthenticatedRequest;

      if (!userId && !userId) {
        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.UNAUTHORIZED
        );
      }
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const userData: ProfileCompletionDto = {
        ...req.body,
        aadhaarDoc: files["aadhaarDoc"]?.[0],
        panDoc: files["panDoc"]?.[0],
        cibilDoc: files["cibilDoc"]?.[0],
      };
      this._profileService.completeProfile(userId, userData);

      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.PROFILE_UPDATED });
    } catch (error) {
      next(error);
    }
  }

  async editProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { userId } = req as AuthenticatedRequest;
       if (!userId) {
         throw new CustomError(
           MESSAGES.INVALID_CREDENTIALS,
           STATUS_CODES.UNAUTHORIZED
         );
       }

      this._profileService.editProfile(userId,req.body)

      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.CREATED});
    } catch (error) {
      next(error);
    }
  }

  async contactUs(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { firstName, lastName, email, phone, message } = req.body;
      await this._profileService.contactUs(
        firstName,
        lastName,
        email,
        phone,
        message
      );
      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.CREATED });
    } catch (error) {
      next(error);
    }
  }
}
