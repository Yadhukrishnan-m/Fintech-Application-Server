import { IOtp } from "../../models/otp.model";
import { OtpGenerationDTO } from "../../dtos/user/auth/otp-generation.dto";
export interface IOtpRepository {
  createOtp(otpData: OtpGenerationDTO): Promise<IOtp>;
  findOtp(email: string): Promise<IOtp |null >;
}
   