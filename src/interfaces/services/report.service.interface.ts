import { FinancialReportItem } from "../../services/helpers/reportService";


export interface IReportService {
  generateFinancialReportPdf(data: FinancialReportItem[]): any;
  generateFinancialReportExcel(data: FinancialReportItem[]): any;
}
