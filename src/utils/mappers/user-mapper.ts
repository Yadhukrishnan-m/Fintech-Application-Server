import { IUser } from "../../models/user.model";
import { UserRegisterDTO } from "../../dtos/user/auth/user-register.dto";
import { ProfileCompletionDto } from "../../dtos/user/auth/profile-completion.dto";

export class UserMapper {

  static toRegistrationModel(userDto: UserRegisterDTO): Partial<IUser> {
    return {
      customerId: userDto.customerId,
      name: userDto.name,
      email: userDto.email,
      password: userDto.password,
    };
  }
}
