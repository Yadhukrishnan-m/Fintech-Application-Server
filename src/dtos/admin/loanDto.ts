import { Express } from "express";

export interface LoanDTO {
  name: string;
  description: string;
  status: string;
  minimumAmount: string;
  maximumAmount: string;
  minimumTenure: string;
  maximumTenure: string;
  minimumInterest: string;
  maximumInterest: string;
  duePenalty: string;
  features: string;
  eligibility: string;
  loanImage?: Express.Multer.File;
  additionalDocuments?: string[];
}
