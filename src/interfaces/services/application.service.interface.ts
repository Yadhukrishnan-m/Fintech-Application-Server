import { ApplicationDto } from "../../dtos/admin/applicationDTO";
import { IApplication, IApplicationPopulated } from "../../models/application.model";


export interface IApplicationService {
  createApplication(
    applicationData: ApplicationDto,
    userId: string
  ): Promise<void>;
  getApplicationsByUserId(
    userId: string,
    page: number
  ): Promise<{
    applications: IApplication[];
    totalPages: number;
    currentPage: number;
    totalApplications: number;
  }>;
  getApplicationDetails(
    userId: string,
    applicationId: string
  ): Promise<IApplicationPopulated>;
  cancelApplication(applicationId: string): Promise<void>;
}
