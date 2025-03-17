
import { OtpGenerationDTO } from "../../dtos/user/auth/otp-generation.dto";
import { IOtpRepository } from "../../interfaces/repositories/otp.repository.interface";
import OtpModel, { IOtp } from "../../models/otp.model";
export class OtpRepository implements IOtpRepository {
  async createOtp(otpData: OtpGenerationDTO): Promise<IOtp> {
    const otp = new OtpModel(otpData);
    return await otp.save();
  }
  async findOtp(email:string):Promise<IOtp | null>{
    return await OtpModel.findOne({email}).sort({createdAt:-1}).exec()
  }
}