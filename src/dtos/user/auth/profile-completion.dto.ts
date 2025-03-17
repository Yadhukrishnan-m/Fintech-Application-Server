import { Express } from "express";

export interface ProfileCompletionDto {
  phone: string;
  dob: string;
  job: string;
  income: string;
  gender: "male" | "female" | "other";
  aadhaarNumber: string;
  panNumber: string;
  cibilScore: string;
  aadhaarDoc: Express.Multer.File 
  panDoc: Express.Multer.File
  cibilDoc: Express.Multer.File 
}
