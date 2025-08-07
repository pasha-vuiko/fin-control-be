import {
  IEmailVerificationCodeData,
  IEmailVerificationFlowData,
} from '@shared/modules/email/interfaces/email-verification-data.interface';
import { IExpirationKeyValueStore } from '@shared/modules/email/interfaces/expiration-key-value-store.interface';

export class EmailVerificationRepository {
  private readonly verificationFlowTag: string;
  private readonly expirationStore: IExpirationKeyValueStore;
  private readonly flowTimeOutSecs: number;
  private readonly codeResendThresholdSecs: number;
  private readonly codeExpirationTimeout: number;

  constructor(options: IEmailVerificationDataRepositoryOpts) {
    const {
      verificationFlowTag,
      expirationStore,
      codeExpirationTimeout,
      flowTimeOutSecs,
      codeResendThresholdSecs,
    } = options;

    this.verificationFlowTag = verificationFlowTag;
    this.expirationStore = expirationStore;
    this.flowTimeOutSecs = flowTimeOutSecs;
    this.codeResendThresholdSecs = codeResendThresholdSecs;
    this.codeExpirationTimeout = codeExpirationTimeout;
  }

  async getIsFlowStarted(userId: string): Promise<boolean> {
    const flowDataKey = this.getFlowDataKey(userId);

    return await this.expirationStore.checkIfExists(flowDataKey);
  }

  async startFlow(userId: string, email: string): Promise<boolean> {
    const flowDataKey = this.getFlowDataKey(userId);
    const flowData: IEmailVerificationFlowData = {
      email,
      isVerified: false,
    };

    await this.expirationStore.set(flowDataKey, flowData, this.flowTimeOutSecs);

    return true;
  }

  async getFlowData(userId: string): Promise<IEmailVerificationFlowData | null> {
    const flowDataKey = this.getFlowDataKey(userId);

    return await this.expirationStore.get<IEmailVerificationFlowData>(flowDataKey);
  }

  async markEmailAsNotVerified(userId: string): Promise<boolean> {
    const flowDataKey = this.getFlowDataKey(userId);
    const flowData =
      await this.expirationStore.get<IEmailVerificationFlowData>(flowDataKey);

    await this.expirationStore.update(flowDataKey, { ...flowData, isVerified: false });

    return true;
  }

  async markEmailAsVerified(userId: string): Promise<boolean> {
    const flowDataKey = this.getFlowDataKey(userId);
    const flowData =
      await this.expirationStore.get<IEmailVerificationFlowData>(flowDataKey);

    await this.expirationStore.update(flowDataKey, { ...flowData, isVerified: true });

    return true;
  }

  async getVerificationCode(userId: string): Promise<number | null> {
    const verificationDataKey = this.getVerificationDataKey(userId);
    const verificationData =
      await this.expirationStore.get<IEmailVerificationCodeData>(verificationDataKey);

    return verificationData?.verificationCode ?? null;
  }

  async markVerificationCodeAsResent(userId: string): Promise<boolean> {
    const resendKey = this.getCodeResendFlowKey(userId);

    await this.expirationStore.set(resendKey, true, this.codeResendThresholdSecs);

    return true;
  }

  async setVerificationCodeFor(
    userId: string,
    verificationCode: number,
  ): Promise<boolean> {
    const verificationDataKey = this.getVerificationDataKey(userId);

    const verificationCodeData: IEmailVerificationCodeData = {
      verificationCode,
    };

    await this.expirationStore.set(
      verificationDataKey,
      verificationCodeData,
      this.codeExpirationTimeout,
    );

    return true;
  }

  async getIsCodeHasBeenResent(userId: string): Promise<boolean> {
    const resendKey = this.getCodeResendFlowKey(userId);

    return (await this.expirationStore.get<boolean>(resendKey)) ?? false;
  }

  async deleteAllVerificationData(userId: string): Promise<boolean> {
    const flowDataKey = this.getFlowDataKey(userId);
    const verificationDataKey = this.getVerificationDataKey(userId);
    const codeResendKey = this.getCodeResendFlowKey(userId);

    await Promise.all([
      this.expirationStore.delete(flowDataKey),
      this.expirationStore.delete(verificationDataKey),
      this.expirationStore.delete(codeResendKey),
    ]);

    return true;
  }

  private getFlowDataKey(userId: string): string {
    const keyPrefix = `${this.verificationFlowTag}EmailVerificationFlow:`;

    return `${keyPrefix}${userId}`;
  }

  private getVerificationDataKey(userId: string): string {
    const keyPrefix = `${this.verificationFlowTag}EmailVerificationCode:`;

    return `${keyPrefix}${userId}`;
  }

  private getCodeResendFlowKey(userId: string): string {
    const keyPrefix = `${this.verificationFlowTag}EmailVerificationCodeResend:`;

    return `${keyPrefix}${userId}`;
  }
}

export interface IEmailVerificationDataRepositoryOpts {
  verificationFlowTag: string;
  expirationStore: IExpirationKeyValueStore;
  flowTimeOutSecs: number;
  codeResendThresholdSecs: number;
  codeExpirationTimeout: number;
}
