import mongoose, { Document, Schema } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  expireAt: Date;
  createdAt?: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expireAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 120 }, // Auto-delete after 120s
  },
  { collection: "otp" } 
);

const OtpModel = mongoose.model<IOtp>("Otp", OtpSchema);
export default OtpModel;
