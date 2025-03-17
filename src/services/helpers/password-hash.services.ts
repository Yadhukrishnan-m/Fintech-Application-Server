import bcrypt from "bcrypt";
import { IPasswordService } from "../../interfaces/helpers/password-hash.service.interface";

export class PasswordService implements IPasswordService {
   async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
