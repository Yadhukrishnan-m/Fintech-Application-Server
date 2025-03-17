import { CustomError } from "../../utils/custom-error";
import { IPasswordService } from "../../interfaces/helpers/password-hash.service.interface";
import { LoginDto } from "../../dtos/shared/login.dto";
import { IJwtService } from "../../interfaces/helpers/jwt-service.service.interface";
import { IAuthAdminService } from "../../interfaces/services/auth-admin.service.interface";
import { IAdmin } from "../../models/admin.model";
import { IAdminRepository } from "../../interfaces/repositories/admin.repository.interface";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
export class AuthUserService implements IAuthAdminService {
    
  private passwordService: IPasswordService;
  private jwtService: IJwtService;
  constructor(
    private adminrepository:IAdminRepository,
    passwordService: IPasswordService,
    jwtService: IJwtService,
 
  ) {
    this.passwordService = passwordService;
    this.jwtService = jwtService;
  }
  async login(
    adminCredential: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }> {

    
    const adminData: IAdmin | null = await this.adminrepository.findByEmail(
      adminCredential.email
    );

    if (!adminData) {
      throw new CustomError( MESSAGES.INVALID_CREDENTIALS,
              STATUS_CODES.UNAUTHORIZED);
    }
    if (!adminData.password ) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const isPasswordValid: boolean = await this.passwordService.comparePassword(
      adminCredential.password,
      adminData.password
    );
    if (!isPasswordValid) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }
    const accessToken = this.jwtService.generateAccessToken(adminData._id);
    const refreshToken = this.jwtService.generateRefreshToken(adminData._id);

    return { accessToken, refreshToken };
  }
}
