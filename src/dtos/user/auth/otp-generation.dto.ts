export interface OtpGenerationDTO {
  email: string;
  otp: number;
  expireAt: Date;
}
