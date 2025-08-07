export interface IEmailVerificationCodeData {
  verificationCode: number;
}

export interface IEmailVerificationFlowData {
  email: string;
  isVerified: boolean;
}
