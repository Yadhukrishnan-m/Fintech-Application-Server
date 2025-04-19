
import { LoginDto } from "../../dtos/shared/login.dto";
export interface IAuthAdminService {
  login(
    userCredential: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string }>;
  refreshToken(refreshToken: string): Promise<string>;
}
