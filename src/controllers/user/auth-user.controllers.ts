import { Request, Response, NextFunction } from "express";
import { UserRegisterDTO } from "../../dtos/user/auth/user-register.dto";
import { IAuthUserService } from "../../interfaces/services/auth-user.service.interface";
import { LoginDto } from "../../dtos/shared/login.dto";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { TYPES } from "../../config/inversify/inversify.types"; 
import { injectable, inject } from "inversify";

interface AuthenticatedRequest extends Request {
  userId: string;
}


@injectable()
export class AuthUserController {
  constructor(
    @inject(TYPES.AuthUserService) private _authUserService: IAuthUserService
  ) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: UserRegisterDTO = req.body;

      await this._authUserService.registerUser(userData);
      res
        .status(STATUS_CODES.CREATED)
        .json({ message: MESSAGES.REGISTRATION_SUCCESS });
    } catch (error: any) {
      next(error);
    }
  }

  async generateOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const email: string = req.body.email;
      await this._authUserService.generateOtp(email);
      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.OTP_SENT });
    } catch (error) {
      next(error);
    }
  }
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      await this._authUserService.verifyOtp(req.body);

      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: MESSAGES.OTP_VERIFIED });
    } catch (error) {
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginCredential: LoginDto = req.body;
      const { refreshToken, accessToken } = await this._authUserService.login(
        loginCredential
      );

      res.cookie("userRefreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: MESSAGES.LOGIN_SUCCESS, accessToken });
    } catch (error) {
      next(error);
    }
  }
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken: string = req.cookies.userRefreshToken;
      if (!refreshToken) {
        res.status(STATUS_CODES.BAD_REQUEST).json("no refresh token available");
        return;
      }
      const accessToken: string = await this._authUserService.refreshToken(
        refreshToken
      );
      res
        .status(STATUS_CODES.OK)
        .json({ message: "new token created", accessToken: accessToken });
    } catch (error) {
      next(error);
    }
  }
  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const googleToken: string = req.body.token;
      const { refreshToken, accessToken } =
        await this._authUserService.googleLogin(googleToken);
      res.cookie("userRefreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.LOGIN_SUCCESS, accessToken });
    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const email: string = req.body.email;
      await this._authUserService.forgotPassword(email);
      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.PASSWORD_RESET_SENT });
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await this._authUserService.resetPassword(token, password);
      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.PASSWORD_RESET_SUCCESS });
    } catch (error) {
      next(error);
    }
  }
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
        const { userId } = req as AuthenticatedRequest;
        await this._authUserService.changePassword(
          currentPassword,
          newPassword,
          userId
        );
      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.PASSWORD_RESET_SUCCESS });
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
        message: MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }
}
