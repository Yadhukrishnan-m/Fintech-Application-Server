import { OtpRepository } from "../repositories/otp.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuthUserService } from "../services/user/auth-user.services";
import {  PasswordService } from "../services/helpers/password-hash.services";
import { EmailService } from "../services/helpers/email.services";
import { AuthUserController } from "../controllers/user/auth-user.controllers";
import { JwtService } from "../services/helpers/jwt-auth.services";
import { ProfileController } from "../controllers/user/user-profile.controllers";
import { ProfileService } from "../services/user/user-profile.services";
import UploadToS3 from "../services/helpers/FileUploadService";

const userRepository = new UserRepository();
const otpRepository=new OtpRepository();
const passwordService=new PasswordService()
const emailService=new EmailService
const uploadToS3=new UploadToS3()
const jwtService = new JwtService();
//services
const authUserService = new AuthUserService(
  userRepository,
  otpRepository,
  passwordService,
  emailService,
  jwtService
);
const profileService = new ProfileService(
  userRepository,
  uploadToS3,
  emailService
);

const authUserController = new AuthUserController(authUserService);
const profilecontroller = new ProfileController(profileService);

export { authUserController, profilecontroller };
