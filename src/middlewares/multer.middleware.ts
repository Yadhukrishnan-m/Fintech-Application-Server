import multer, { FileFilterCallback } from "multer";
import express, { Request } from "express";
import { Express } from "express";
import path from "path";

// Configure Multer Storage
const storage = multer.memoryStorage();

// File Filter (Only Allow Certain File Types)
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
 const allowedTypes = [
   "image/jpeg",
   "image/png",
   "image/webp",
   "image/svg+xml",
   "image/bmp",
   "image/tiff",
   "image/avif",
 ];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."),
      false
    );
  }
  cb(null, true);
};

// Initialize Multer
export const upload = multer({ storage, fileFilter });

// Reusable Middleware for Multiple Routes
export const uploadFiles = upload.fields([
  { name: "aadhaarDoc", maxCount: 1 },
  { name: "panDoc", maxCount: 1 },
  { name: "cibilDoc", maxCount: 1 },
]);

export const uploadLoanImage = upload.single("loanImage");
