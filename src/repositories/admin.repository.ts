
import { injectable } from "inversify";
import { IAdminRepository } from "../interfaces/repositories/admin.repository.interface";
import AdminModel, { IAdmin } from "../models/admin.model";
import { BaseRepository } from "./base.repository";

@injectable()
export class AdminRepository  extends BaseRepository<IAdmin> implements IAdminRepository {
   constructor() {
      super(AdminModel);
    }
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await AdminModel.findOne({ email });
  }
 
}
