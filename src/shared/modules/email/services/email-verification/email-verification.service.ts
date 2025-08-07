import { EmailTemplateType } from '@shared/modules/email/enums/email-template-type.enum';
import { EmailVerificationFlowState } from '@shared/modules/email/enums/email-verification-flow-state.enum';
import {
  EmailVerificationAlreadyStartedException,
  EmailVerificationCodeExpiredException,
  EmailVerificationCodeInvalidException,
  EmailVerificationCodeThresholdException,
  EmailVerificationNotStartedException,
  FailedToSendEmailException,
} from '@shared/modules/email/exceptions/exception-classes';
import { IEmailService } from '@shared/modules/email/interfaces/email-service.interface';
import { IExpirationKeyValueStore } from '@shared/modules/email/interfaces/expiration-key-value-store.interface';
import { EmailVerificationRepository } from '@shared/modules/email/repositories/email-verification.repository';
import { SesEmailService } from '@shared/modules/email/services/ses-email/ses-email.service';
import { generateRandomNum } from '@shared/utils/generate-random-six-digit-num.util';

export class EmailVerificationService {
  private readonly emailSubject: string;
  private readonly emailService: IEmailService;

  private readonly emailVerificationRepository: EmailVerificationRepository;

  constructor(options: IEmailVerificationServiceOptions) {
    const {
      verificationFlowTag,
      emailSubject,
      emailService,
      expirationStore,
      flowTimeOutSecs = 3600, // 1 hour
      codeResendThresholdSecs = 60, // 1 minute
      codeExpirationTimeout = 5 * 60, // 5 minutes
    } = options;

    this.emailSubject = emailSubject;
    this.emailService = emailService;

    this.emailVerificationRepository = new EmailVerificationRepository({
      verificationFlowTag,
      expirationStore,
      codeResendThresholdSecs,
      codeExpirationTimeout,
      flowTimeOutSecs,
    });
  }

  /**
   *
   * @param userId
   * @param email
   * @throws EmailVerificationAlreadyStartedException
   * @throws FailedToSendEmailException
   */
  async start(userId: string, email: string): Promise<boolean> {
    const isVerificationFlowStarted =
      await this.emailVerificationRepository.getIsFlowStarted(userId);

    if (isVerificationFlowStarted) {
      throw new EmailVerificationAlreadyStartedException();
    }

    const verificationCode = await this.sendEmailVerificationCode(email);

    await this.emailVerificationRepository.startFlow(userId, email);
    await this.emailVerificationRepository.setVerificationCodeFor(
      userId,
      verificationCode,
    );

    return true;
  }

  /**
   *
   * @throws EmailVerificationNotStartedException
   * @throws EmailVerificationCodeThresholdException
   * @throws FailedToSendEmailException
   * @param userId
   */
  async resendCode(userId: string): Promise<boolean> {
    const flowData = await this.emailVerificationRepository.getFlowData(userId);

    if (!flowData) {
      throw new EmailVerificationNotStartedException();
    }
    if (flowData.isVerified) {
      return await this.resendVerificationCodeToEmail(userId, flowData.email);
    }

    const isCodeAlreadyResent =
      await this.emailVerificationRepository.getIsCodeHasBeenResent(userId);

    if (isCodeAlreadyResent) {
      throw new EmailVerificationCodeThresholdException();
    }

    return await this.resendVerificationCodeToEmail(userId, flowData.email);
  }

  /**
   *
   * @param userId
   * @param verificationCode
   * @throws EmailVerificationNotStartedException
   * @throws EmailVerificationCodeInvalidException
   */
  async verify(userId: string, verificationCode: number): Promise<boolean> {
    const isVerificationFlowStarted =
      await this.emailVerificationRepository.getIsFlowStarted(userId);

    if (!isVerificationFlowStarted) {
      throw new EmailVerificationNotStartedException();
    }

    const sentVerificationCode =
      await this.emailVerificationRepository.getVerificationCode(userId);

    if (!sentVerificationCode) {
      throw new EmailVerificationCodeExpiredException();
    }
    if (sentVerificationCode !== verificationCode) {
      throw new EmailVerificationCodeInvalidException();
    }

    await this.emailVerificationRepository.markEmailAsVerified(userId);

    return true;
  }

  async getState(userId: string): Promise<EmailVerificationFlowState> {
    const flowData = await this.emailVerificationRepository.getFlowData(userId);

    if (!flowData) {
      return EmailVerificationFlowState.NOT_STARTED;
    }
    if (flowData && !flowData.isVerified) {
      return EmailVerificationFlowState.STARTED_NOT_VERIFIED;
    }

    return EmailVerificationFlowState.VERIFIED;
  }

  async getEmail(userId: string): Promise<string> {
    const flowData = await this.emailVerificationRepository.getFlowData(userId);

    if (!flowData) {
      throw new EmailVerificationNotStartedException();
    }

    return flowData.email;
  }

  async resetFlow(userId: string): Promise<boolean> {
    return await this.emailVerificationRepository.deleteAllVerificationData(userId);
  }

  private async resendVerificationCodeToEmail(
    userId: string,
    email: string,
  ): Promise<boolean> {
    const verificationCode = await this.sendEmailVerificationCode(email);

    await this.emailVerificationRepository.markEmailAsNotVerified(userId);
    await this.emailVerificationRepository.setVerificationCodeFor(
      userId,
      verificationCode,
    );
    await this.emailVerificationRepository.markVerificationCodeAsResent(userId);

    return true;
  }

  private async sendEmailVerificationCode(email: string): Promise<number> {
    const verificationCode = generateRandomNum();

    await this.emailService
      .sendEmail(
        email,
        {
          type: EmailTemplateType.REACTIVATE_ACCOUNT,
          body: {
            code: verificationCode,
          },
        },
        this.emailSubject,
      )
      .catch(err => {
        throw new FailedToSendEmailException({
          cause: err,
        });
      });

    return verificationCode;
  }
}

export interface IEmailVerificationServiceOptions {
  verificationFlowTag: string;
  emailSubject: string;
  emailService: SesEmailService;
  expirationStore: IExpirationKeyValueStore;
  flowTimeOutSecs?: number;
  codeResendThresholdSecs?: number;
  codeExpirationTimeout?: number;
}
