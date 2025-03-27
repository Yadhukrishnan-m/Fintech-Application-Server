import { IOtp } from "../../models/otp.model";
import { OtpGenerationDTO } from "../../dtos/user/auth/otp-generation.dto";
import { IBaseRepository } from "./base.repository.interface";
export interface IOtpRepository extends IBaseRepository<IOtp> {
  // createOtp(otpData: OtpGenerationDTO): Promise<IOtp>;
  findOtp(email: string): Promise<IOtp |null >;
}
   