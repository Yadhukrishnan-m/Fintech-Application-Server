import { ProfileCompletionDto } from "../../dtos/user/auth/profile-completion.dto";
import { IUser } from "../../models/user.model";
export interface IProfileService {
  getUser(_id: string): Promise<IUser>;
  completeProfile(userId:string,userData:ProfileCompletionDto):Promise<void>
 
}
