import { IApplication, IApplicationPopulated } from "../../models/application.model";
import { IBaseRepository } from "./base.repository.interface";

export interface IApplicationRepository extends IBaseRepository<IApplication> {
  countDocuments(query: any): Promise<number>;
  getApplications(
    query: any,
    sortQuery: any,
    skip: number,
    pageSize: number
  ): Promise<any>;
  applicationDetails(id: string): Promise<IApplicationPopulated | null>;
  getApplicationsByuserId(
    sortQuery: any,
    skip: number,
    pageSize: number,
    userId: string
  ): Promise<IApplication[] | null>;
}
 