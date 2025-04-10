import { MESSAGES } from "../../config/constants/messages";
import { STATUS_CODES } from "../../config/constants/status-code";
import { CustomError } from "../../utils/custom-error";
import { injectable, inject } from "inversify";
import { TYPES } from "../../config/inversify/inversify.types";
import { ITransactionRepository } from "../../interfaces/repositories/transaction.repository.interface";
import { today } from "../../config/testDate";
import { IDashboardService } from "../../interfaces/services/dashboard.service.interface";
import { IUserRepository } from "../../interfaces/repositories/user.repository.interface";
import { IUserLoan } from "../../models/user-loan.model";
import { IUserLoanRepository } from "../../interfaces/repositories/user-loan.repository.interface";
import { IApplicationRepository } from "../../interfaces/repositories/application.repository.interface";
import { ITransactionChartData } from "../../repositories/transaction.repository";
import { ITransaction } from "../../models/transaction.model";
import { IEmiCalculator } from "../../interfaces/helpers/emiCalculator.service.interface";
import { IReportService } from "../../interfaces/services/report.service.interface";
import { start } from "repl";
@injectable()
export class DashboardService implements IDashboardService {
  constructor(
    @inject(TYPES.UserRepository)
    private _userRepository: IUserRepository,
    @inject(TYPES.UserLoanRepository)
    private _userLoanRepository: IUserLoanRepository,
    @inject(TYPES.ApplicationRepository)
    private _applicationRepository: IApplicationRepository,
    @inject(TYPES.TransactionRepository)
    private _transactionRepository: ITransactionRepository,
    @inject(TYPES.EmiCalculator)
    private _emiCalculator: IEmiCalculator,
    @inject(TYPES.ReportService)
    private _reportService: IReportService
  ) {}

  async getTotals(): Promise<{
    totalAmount: number;
    totalLoans: number;
    approvalRate: number;
    userCount: number;
  }> {
    const totalAmount = await this._userLoanRepository.getTotalLoanAmount();
    const totalLoans = await this._userLoanRepository.getTotalUserLoanCount();
    const { total, approved } =
      await this._applicationRepository.getApplicationCount();

    let approvalRate = Number(
      (total > 0 ? (approved / total) * 100 : 0).toFixed(2)
    );

    const userCount = await this._userRepository.findCount();

    return {
      totalAmount,
      totalLoans,
      approvalRate,
      userCount,
    };
  }

  async applicationChart(
    timeFrame: string
  ): Promise<
    { name: string; total: number; approved: number; rejected: number }[]
  > {
    const now = new Date();
    let matchStage: any = {};
    let groupStage: any;
    let labelMap: Record<string, string> = {};
    let defaultKeys: (string | number)[] = [];

    if (timeFrame === "monthly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      matchStage = {
        createdAt: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
      };
      groupStage = { $month: "$createdAt" };

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      months.forEach((month, index) => {
        labelMap[index + 1] = month;
      });
      defaultKeys = Array.from({ length: 12 }, (_, i) => i + 1);
    } else {
      const currentYear = now.getFullYear();
      const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
      matchStage = {
        createdAt: {
          $gte: new Date(currentYear - 4, 0, 1),
          $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999),
        },
      };
      groupStage = { $year: "$createdAt" };
      years.forEach((year) => {
        labelMap[year] = year.toString();
      });
      defaultKeys = years;
    }

    const pipeline: any[] = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $group: {
          _id: groupStage,
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } }
    );

    const data = await this._applicationRepository.applicationChartData(
      pipeline
    );

    // Convert result into a map for easy access
    const dataMap: Record<string | number, any> = {};
    data.forEach((item) => {
      dataMap[item._id] = item;
    });

    const result = defaultKeys.map((key) => {
      const item = dataMap[key] || { total: 0, approved: 0, rejected: 0 };
      return {
        name: labelMap[key] || key.toString(),
        total: item.total,
        approved: item.approved,
        rejected: item.rejected,
      };
    });

    return result;
  }

  async transactionChart(
    timeFrame: "monthly" | "yearly"
  ): Promise<ITransactionChartData[]> {
    const now = today;
    let matchStage = {};

    if (timeFrame === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      matchStage = {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      };
    } else if (timeFrame === "yearly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      matchStage = {
        createdAt: { $gte: startOfYear, $lte: endOfYear },
      };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalInterest: { $sum: { $ifNull: ["$interestAmount", 0] } },
          totalPenalty: { $sum: { $ifNull: ["$penaltyAmount", 0] } },
        },
      },
    ];

    const { totalAmount, totalInterest, totalPenalty } =
      await this._transactionRepository.transactionChart(pipeline);

    const principal = totalAmount - totalInterest - totalPenalty;

    return [
      { name: "Principal", value: principal },
      { name: "Interest", value: totalInterest },
      { name: "Penalty", value: totalPenalty },
    ];
  }

  async DownloadReport(
    documentType: string,
    startDate:string,
    endDate:string
  ): Promise<string> {
    const allUserLoans=await this._userLoanRepository.getLoansBetweenDates(new Date(startDate),new Date(endDate))
    // const allUserLoans = await this._userLoanRepository.findAll();
    const report: any[] = [];

    for (const userLoan of allUserLoans) {
      const transactions =
        await this._transactionRepository.getUserLoanTransactions(
          userLoan._id.toString()
        );
      const user = await this._userRepository.findById(
        userLoan.userId.toString()
      );
      if (!user) continue;

      const principalAmount = userLoan.amount;
      const annualInterestRate = userLoan.interest;
      const tenure = userLoan.tenure;

      const { emi } = this._emiCalculator.calculateEmi(
        principalAmount,
        annualInterestRate,
        tenure
      );

      //   const today = new Date();
      today.setHours(0, 0, 0, 0);

      const rawDueDate = new Date(userLoan.createdAt);
      const startingDueDate = new Date(rawDueDate);
      startingDueDate.setHours(0, 0, 0, 0);
      startingDueDate.setMonth(startingDueDate.getMonth() + 1);

      const paidTransactions = new Map<number, ITransaction>();
      let count = 1;

      if (transactions) {
        transactions.forEach((tx) => {
          paidTransactions.set(count++, tx);
        });
      }

      let hasUnpaidEMI = false;
      let totalPendingPenalty = 0;

      for (let i = 1; i <= tenure; i++) {
        const thisEmiDueDate = new Date(startingDueDate);
        thisEmiDueDate.setMonth(thisEmiDueDate.getMonth() + (i - 1));
        thisEmiDueDate.setHours(0, 0, 0, 0);

        const isPaid = paidTransactions.has(i);
        const gracePeriodEndDate = new Date(thisEmiDueDate);
        gracePeriodEndDate.setDate(
          gracePeriodEndDate.getDate() + userLoan.gracePeriod
        );
        gracePeriodEndDate.setHours(23, 59, 59, 999);

        if (!isPaid && today > gracePeriodEndDate) {
          const penalty = this._emiCalculator.calculatePenalty(
            emi,
            userLoan.duePenalty,
            gracePeriodEndDate,
            today
          );
          if (!hasUnpaidEMI) hasUnpaidEMI = true;
          totalPendingPenalty += penalty;
        }
      }

      const totalPaid =
        transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      const penaltyPaid =
        transactions?.reduce((sum, tx) => sum + (tx.penaltyAmount || 0), 0) ||
        0;
      const interestPaid =
        transactions?.reduce((sum, tx) => sum + (tx.interestAmount || 0), 0) ||
        0;

      const totalToBePaid = emi * tenure;
      const totalBalanceToPay =
        totalToBePaid - totalPaid + totalPendingPenalty + penaltyPaid;

      report.push({
        customerId: userLoan.userId.toString(),
        loanId: userLoan.userLoanId.toString(),
        loanAmount: principalAmount,
        totalPaid,
        totalBalanceToPay,
        penaltyPaid,
        interestPaid,
      });
    }
    if (documentType == "pdf") {
      const filePath = this._reportService.generateFinancialReportPdf(report);
      return filePath;
    } else {
      return this._reportService.generateFinancialReportExcel(report);
    }
  }
}
