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
export class AuthUserService implements IAuthUserService {
  private userRepository: IUserRepository;
  private otpRepository: IOtpRepository;
  private passwordService: IPasswordService;
  private emailService: IEmailService;
  private jwtService: IJwtService;
  constructor(
    userRepository: IUserRepository,
    otpRepository: IOtpRepository,
    passwordService: IPasswordService,
    emailService: IEmailService,
    jwtService: IJwtService
  ) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
    this.passwordService = passwordService;
    this.emailService = emailService;
    this.jwtService = jwtService;
  }
  async registerUser(
    userData: Omit<UserRegisterDTO, "customerId">
  ): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new CustomError("Email already exists", STATUS_CODES.CONFLICT);
    }
    if (!userData.password) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }
    userData.password = await this.passwordService.hashPassword(
      userData.password
    );
    const UserData: UserRegisterDTO = {
      ...userData,
      customerId: Math.random().toString(36).substring(2, 9),
    };

    return await this.userRepository.createUser(UserData);
  }
  // to generate and sent the otp
  async generateOtp(email: string): Promise<IOtp> {
    const otp: number = Math.floor(1000 + Math.random() * 9000);
    const expireAt: Date = new Date(Date.now() + 2 * 60 * 1000);
    const otpdata: OtpGenerationDTO = {
      email,
      otp,
      expireAt,
    };
    const content: string = this.emailService.generateOtpEmailContent(otp);
    const subject: string = "OTP Verification";

    await this.emailService.sendEmail(email, subject, content);
    return await this.otpRepository.createOtp(otpdata);
  }
  async verifyOtp(otpData: Omit<OtpGenerationDTO, "expireAt">): Promise<void> {
    const data: IOtp | null = await this.otpRepository.findOtp(otpData.email);

    if (!data) {
      throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.UNAUTHORIZED);
    }
    const currentTime = new Date();
    const otpExpiryTime = new Date(data.expireAt);

    const user: IUser | null = await this.userRepository.findByEmail(
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
    const userData: IUser | null = await this.userRepository.findByEmail(
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

    const isPasswordValid: boolean = await this.passwordService.comparePassword(
      userCredential.password,
      userData.password
    );
    if (!isPasswordValid) {
      throw new CustomError(MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }
    
    const accessToken = this.jwtService.generateAccessToken(userData._id);
    const refreshToken = this.jwtService.generateRefreshToken(userData._id);

    return { accessToken, refreshToken };
  }
  async refreshToken(refreshToken: string): Promise<string> {
    const userId: string | null = this.jwtService.verifyToken(
      refreshToken,
      "refresh"
    );
    if (!userId) {
      throw new CustomError("refresh token is not valid", 400);
    }
    return this.jwtService.generateAccessToken(userId);
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

    let user: IUser | null = await this.userRepository.findByEmail(email);

    if (!user) {
      const UserData: UserRegisterDTO = {
        email: email,
        name: name,
        customerId: Math.random().toString(36).substring(2, 9),
      };
      user = await this.userRepository.createUser(UserData);
    }

    const accessToken = this.jwtService.generateAccessToken(user._id);
    const refreshToken = this.jwtService.generateRefreshToken(user._id);

    return { accessToken, refreshToken };
  }
 async  forgotPassword(email:string):Promise<void>{
   const user=await this.userRepository.findByEmail(email)
   
   
   if (!user) {
    throw new CustomError(MESSAGES.RESOURCE_NOT_FOUND, STATUS_CODES.NOT_FOUND);
   }
   const token=this.jwtService.generateAccessToken(email)
   const  resetLink=process.env.FRONTEND_URI+'/reset-password/'+token
   const content = this.emailService.generateResetPasswordEmailContent(resetLink)
     await this.emailService.sendEmail(email,'Reset Password',content)

 }
 async resetPassword(token:string,password:string):Promise<void>{



    const email = await this.jwtService.verifyToken(token, "access");
    const user=await this.userRepository.findByEmail(email)
    if (!user) {
      throw new CustomError(MESSAGES.RESOURCE_NOT_FOUND, STATUS_CODES.NOT_FOUND)
    }
    const hashedPassword=await this.passwordService.hashPassword(password)
     await this.userRepository.updatePassword(email,hashedPassword)

 }
}
