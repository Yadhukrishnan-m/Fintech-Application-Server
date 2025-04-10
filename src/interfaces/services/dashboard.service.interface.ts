import { ICapital } from "../../models/capital.model";
import { ITransaction, ITransactionPopulated } from "../../models/transaction.model";
import { ITransactionChartData } from "../../repositories/transaction.repository";

export interface IDashboardService {
  getTotals(): Promise<{
    totalAmount: number;
    totalLoans: number;
    approvalRate: number;
    userCount: number;
  }>;
  applicationChart(
    timeFrame: string
  ): Promise<
    { name: string; total: number; approved: number; rejected: number }[]
  >;
  transactionChart(timeFrame: string): Promise<ITransactionChartData[]>;

  DownloadReport(documentType: string, startDate:string, endDate:string): Promise<any>;
}
