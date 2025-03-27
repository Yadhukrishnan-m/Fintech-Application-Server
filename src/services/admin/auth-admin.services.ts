import { CustomError } from "../../utils/custom-error";
import { IPasswordService } from "../../interfaces/helpers/password-hash.service.interface";
import { LoginDto } from "../../dtos/shared/login.dto";
import { IJwtService } from "../../interfaces/helpers/jwt-service.service.interface";
import { IAuthAdminService } from "../../interfaces/services/auth-admin.service.interface";
import { IAdmin } from "../../models/admin.model";
import { IAdminRepository } from "../../interfaces/repositories/admin.repository.interface";
import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
@injectable()
export class AuthAdminService implements IAuthAdminService {
  constructor(
    @inject(TYPES.AdminRepository) private _adminrepository: IAdminRepository,
    @inject(TYPES.PasswordService) private _passwordService: IPasswordService,
    @inject(TYPES.JwtService)  private _jwtService: IJwtService
  ) {}
  async login(
    adminCredential: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const adminData: IAdmin | null = await this._adminrepository.findByEmail(
      adminCredential.email
    );
  
    
    if (!adminData) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }
     
    if (!adminData.password) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const isPasswordValid: boolean =
      await this._passwordService.comparePassword(
        adminCredential.password,
        adminData.password
      );
    if (!isPasswordValid) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED
      );
    }
    const accessToken = this._jwtService.generateAccessToken(adminData._id);
    const refreshToken = this._jwtService.generateRefreshToken(adminData._id);

    return { accessToken, refreshToken };
  }
}
