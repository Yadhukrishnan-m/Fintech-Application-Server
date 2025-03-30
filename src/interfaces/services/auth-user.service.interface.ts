import { UserRegisterDTO } from "../../dtos/user/auth/user-register.dto";
import { IOtp } from "../../models/otp.model";
import { IUser } from "../../models/user.model";
import { OtpGenerationDTO } from "../../dtos/user/auth/otp-generation.dto";
import { LoginDto } from "../../dtos/shared/login.dto";
export interface IAuthUserService {
  registerUser(userData: UserRegisterDTO): Promise<IUser>;
  generateOtp(email: string): Promise<IOtp>;
  verifyOtp(otpData: Omit<OtpGenerationDTO, "expireAt">): Promise<void>;
  login(
    userCredential: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }>;
  refreshToken(refreshToken: string): Promise<string>;
  googleLogin(
    googleToken: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string,userId:string): Promise<void>;
}
