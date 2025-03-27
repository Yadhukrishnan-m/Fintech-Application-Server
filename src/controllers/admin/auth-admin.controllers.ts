import { Request, Response, NextFunction } from "express";
import { LoginDto } from "../../dtos/shared/login.dto";
import { IAuthAdminService } from "../../interfaces/services/auth-admin.service.interface";
import { STATUS_CODES } from "../../config/constants/status-code";
import { MESSAGES } from "../../config/constants/messages";
import { TYPES } from "../../config/inversify/inversify.types";
import { injectable, inject } from "inversify";
@injectable()
export class AuthAdminController {
  constructor(
    @inject(TYPES.AuthAdminService) private _authAdminService: IAuthAdminService
  ) {}
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginCredential: LoginDto = req.body;
      const { refreshToken, accessToken } = await this._authAdminService.login(
        loginCredential
      );
      res.cookie("adminRefreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: MESSAGES.LOGIN_SUCCESS, accessToken });
    } catch (error) {
      next(error);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("userRefreshToken", {
        httpOnly: true,
        secure: false,
      });
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.LOGIN_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }
}
