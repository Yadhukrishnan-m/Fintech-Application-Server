
import { injectable } from "inversify";
import { IAdminRepository } from "../interfaces/repositories/admin.repository.interface";
import AdminModel, { IAdmin } from "../models/admin.model";

@injectable()
export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await AdminModel.findOne({ email });
  }
 
}
