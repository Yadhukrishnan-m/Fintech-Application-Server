import { IAuthUserService } from "../../interfaces/services/auth-user.service.interface";
import { UserRegisterDTO } from "../../dtos/user/auth/user-register.dto";
import { OtpGenerationDTO } from "../../dtos/user/auth/otp-generation.dto";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IUser } from "../../models/user.model";
import { IOtp } from "../../models/otp.model";
import { CustomError } from "../../utils/custom-error";
import { IOtpRepository } from "../../interfaces/repositories/otp.repository.interface";
import { IPasswordService } from "../../interfaces/helpers/password-hash.service.interface";
import { IEmailService } from "../../interfaces/helpers/email-service.service.interface";
import { LoginDto } from "../../dtos/shared/login.dto";
import { IJwtService } from "../../interfaces/helpers/jwt-service.service.interface";
import { OAuth2Client } from "google-auth-library";
import { error } from "console";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { UserMapper } from "../../utils/mappers/user-mapper";
@injectable()
export class AuthUserService implements IAuthUserService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.OtpRepository) private _otpRepository: IOtpRepository,
    @inject(TYPES.PasswordService) private _passwordService: IPasswordService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.JwtService) private _jwtService: IJwtService
  ) {}
  async registerUser(
    userData: Omit<UserRegisterDTO, "customerId">
  ): Promise<IUser> {
    const existingUser = await this._userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new CustomError("Email already exists", STATUS_CODES.CONFLICT);
    }
    if (!userData.password) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }
    userData.password = await this._passwordService.hashPassword(
      userData.password
    );
    const UserData: UserRegisterDTO = {
      ...userData,
      customerId: Math.random().toString(36).substring(2, 9),
    };

    return await this._userRepository.create(UserData);
  }
  // to generate and sent the otp
  async generateOtp(email: string): Promise<IOtp> {
    const otp: number = Math.floor(1000 + Math.random() * 9000);
    const expireAt: Date = new Date(Date.now() + 2 * 60 * 1000);
    const otpdata: Partial<IOtp> = {
      email,
      otp: String(otp),
      expireAt,
    };
    const content: string = this._emailService.generateOtpEmailContent(otp);
    const subject: string = "OTP Verification";

    await this._emailService.sendEmail(email, subject, content);
    return await this._otpRepository.create(otpdata);
  }
  async verifyOtp(otpData: Omit<OtpGenerationDTO, "expireAt">): Promise<void> {
    const data: IOtp | null = await this._otpRepository.findOtp(otpData.email);

    if (!data) {
      throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.UNAUTHORIZED);
    }
    const currentTime = new Date();
    const otpExpiryTime = new Date(data.expireAt);

    const user: IUser | null = await this._userRepository.findByEmail(
      otpData.email
    );
    if (user) {
      throw new CustomError("Email already exists", STATUS_CODES.CONFLICT);
    }
    if (data.otp !== String(otpData.otp)) {
      throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.UNAUTHORIZED);
    }
    if (currentTime > otpExpiryTime) {
      throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.UNAUTHORIZED);
    }
  }

  async login(
    userCredential: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userData: IUser | null = await this._userRepository.findByEmail(
      userCredential.email
    );

    if (!userData) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }
    if (!userData.password) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const isPasswordValid: boolean =
      await this._passwordService.comparePassword(
        userCredential.password,
        userData.password
      );
    if (!isPasswordValid) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const accessToken = this._jwtService.generateAccessToken(userData._id);
    const refreshToken = this._jwtService.generateRefreshToken(userData._id);

    return { accessToken, refreshToken };
  }
  async refreshToken(refreshToken: string): Promise<string> {
    const userId: string | null = this._jwtService.verifyToken(
      refreshToken,
      "refresh"
    );
    if (!userId) {
      throw new CustomError("refresh token is not valid", 400);
    }
    return this._jwtService.generateAccessToken(userId);
  }
  async googleLogin(
    googleToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
      throw new CustomError("Invalid Google Token", 400);
    }
    const { email, name } = payload;

    let user: IUser | null = await this._userRepository.findByEmail(email);

    if (!user) {
      const UserData: UserRegisterDTO = {
        email: email,
        name: name,
        customerId: Math.random().toString(36).substring(2, 9),
      };
      const userModel = UserMapper.toRegistrationModel(UserData);
      user = await this._userRepository.create(userModel);
    }

    const accessToken = this._jwtService.generateAccessToken(user._id);
    const refreshToken = this._jwtService.generateRefreshToken(user._id);

    return { accessToken, refreshToken };
  }
  async forgotPassword(email: string): Promise<void> {
    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new CustomError(
        MESSAGES.RESOURCE_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    const token = this._jwtService.generateAccessToken(email);
    const resetLink = process.env.FRONTEND_URI + "/reset-password/" + token;
    const content =
      this._emailService.generateResetPasswordEmailContent(resetLink);
    await this._emailService.sendEmail(email, "Reset Password", content);
  }
  async resetPassword(token: string, password: string): Promise<void> {
    const email = await this._jwtService.verifyToken(token, "access");
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError(
        MESSAGES.RESOURCE_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    const hashedPassword = await this._passwordService.hashPassword(password);
    await this._userRepository.updatePassword(email, hashedPassword);
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    userId:string
  ): Promise<void> {


   
    const user = await this._userRepository.findById(userId);
         console.log(user?.password);

 if (!user?.password) {
   throw new CustomError("user dont have current password(logged in with google)", STATUS_CODES.NOT_FOUND);
 }

 


    if (!user||!user?.password) {
      throw new CustomError(
        MESSAGES.RESOURCE_NOT_FOUND,
        STATUS_CODES.NOT_FOUND
      );
    }
    const isCurrentPasswordTrue = await this._passwordService.comparePassword(
      currentPassword,
      user.password
    );
  
   
    if (!isCurrentPasswordTrue) {
        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.FORBIDDEN
        );
    }


    const hashedPassword = await this._passwordService.hashPassword(
      newPassword
    );
    const updatedData={
    password:  hashedPassword
    }
    await this._userRepository.updateById(userId, updatedData);
  }
}
