import { Express } from "express";
export interface verifyApplicationDTO{status:string,message?:string}

export interface loanContentDTO {
  userName: string;
  loanName: string;
  loanId: string;
  amount: number;
  interest: number;
  tenure: number;
  accountNumber: string;
  ifscCode: string;
  message?:string
}

export interface ApplicationDto {
  loanId: string;
  amount: number;
  tenure: number;
  accountNumber: string;
  ifscCode: string;
  documents: Express.Multer.File[];
   interest?: number,
    duePenalty?: number
}