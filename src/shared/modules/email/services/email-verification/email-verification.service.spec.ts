import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EmailTemplateType } from '@shared/modules/email/enums/email-template-type.enum';
import { EmailVerificationFlowState } from '@shared/modules/email/enums/email-verification-flow-state.enum';
import {
  EmailVerificationAlreadyStartedException,
  EmailVerificationCodeInvalidException,
  EmailVerificationCodeThresholdException,
  EmailVerificationNotStartedException,
} from '@shared/modules/email/exceptions/exception-classes';
import {
  IEmailVerificationCodeData,
  IEmailVerificationFlowData,
} from '@shared/modules/email/interfaces/email-verification-data.interface';
import { IExpirationKeyValueStore } from '@shared/modules/email/interfaces/expiration-key-value-store.interface';
import { SesEmailService } from '@shared/modules/email/services/ses-email/ses-email.service';

import { EmailVerificationService } from './email-verification.service';

// eslint-disable-next-line max-lines-per-function
describe('EmailVerificationService', () => {
  let emailVerificationService: EmailVerificationService;
  let emailService: SesEmailService;
  let expirationStore: IExpirationKeyValueStore;

  const MOCK_EMAIL_SUBJECT = 'Test Subject';

  beforeEach(() => {
    emailService = {
      sendEmail: vi.fn().mockResolvedValue(true),
    } as unknown as SesEmailService;

    expirationStore = {
      checkIfExists: vi.fn(),
      set: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as IExpirationKeyValueStore;

    emailVerificationService = new EmailVerificationService({
      verificationFlowTag: 'testFlow',
      emailSubject: MOCK_EMAIL_SUBJECT,
      emailService,
      expirationStore,
    });
  });

  describe('start', () => {
    it('should start ses-email verification process', async () => {
      vi.spyOn(expirationStore, 'checkIfExists').mockResolvedValue(false);
      vi.spyOn(expirationStore, 'set').mockResolvedValue(undefined);

      const result = await emailVerificationService.start('userId', 'test@example.com');

      expect(result).toBe(true);
      expect(expirationStore.checkIfExists).toHaveBeenCalledWith(
        'testFlowEmailVerificationFlow:userId',
      );
      expect(expirationStore.set).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          type: EmailTemplateType.REACTIVATE_ACCOUNT,
          body: {
            code: expect.any(Number),
          },
        },
        MOCK_EMAIL_SUBJECT,
      );
    });

    it('should throw EmailVerificationAlreadyStartedException if verification already started', async () => {
      vi.spyOn(expirationStore, 'checkIfExists').mockResolvedValue(true);

      await expect(
        emailVerificationService.start('userId', 'test@example.com'),
      ).rejects.toThrow(EmailVerificationAlreadyStartedException);
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('resendCode', () => {
    it('should resend ses-email verification code', async () => {
      const mockData: IEmailVerificationFlowData = {
        isVerified: false,
        email: 'test@example.com',
      };

      vi.spyOn(expirationStore, 'get')
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce(false);
      vi.spyOn(expirationStore, 'set').mockResolvedValue(undefined);

      const result = await emailVerificationService.resendCode('test@example.com');

      expect(result).toBe(true);
      expect(expirationStore.get).toHaveBeenCalled();
      expect(expirationStore.set).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        mockData.email,
        {
          type: EmailTemplateType.REACTIVATE_ACCOUNT,
          body: {
            code: expect.any(Number),
          },
        },
        MOCK_EMAIL_SUBJECT,
      );
    });

    it('should throw EmailVerificationNotStartedException if verification not started', async () => {
      vi.spyOn(expirationStore, 'get').mockResolvedValue(null);

      await expect(
        emailVerificationService.resendCode('test@example.com'),
      ).rejects.toThrow(EmailVerificationNotStartedException);
    });

    it('should resend code if ses-email already verified and mark the ses-email as not verified', async () => {
      const mockData: IEmailVerificationFlowData = {
        isVerified: true,
        email: 'test@example.com',
      };

      vi.spyOn(expirationStore, 'get').mockResolvedValue(mockData);
      const sendEmailSpy = vi.spyOn(emailService, 'sendEmail').mockResolvedValue(true);

      const result = await emailVerificationService.resendCode('userId');

      expect(result).toEqual(true);
      expect(sendEmailSpy).toHaveBeenCalledOnce();
    });

    it('should throw EmailVerificationCodeThresholdException if resend threshold not met', async () => {
      const mockData: IEmailVerificationFlowData = {
        isVerified: false,
        email: 'test@example.com',
      };

      vi.spyOn(expirationStore, 'get').mockResolvedValueOnce(mockData);
      vi.spyOn(expirationStore, 'get').mockResolvedValueOnce(true);

      await expect(emailVerificationService.resendCode(mockData.email)).rejects.toThrow(
        EmailVerificationCodeThresholdException,
      );
    });
  });

  describe('verify', () => {
    it('should verify the ses-email with correct code', async () => {
      const mockData: IEmailVerificationCodeData = {
        verificationCode: 123456,
      };

      vi.spyOn(expirationStore, 'checkIfExists').mockResolvedValue(true);
      vi.spyOn(expirationStore, 'get').mockResolvedValue(mockData);
      vi.spyOn(expirationStore, 'update').mockResolvedValue(undefined);

      const result = await emailVerificationService.verify('test@example.com', 123456);

      expect(result).toBe(true);
      expect(expirationStore.update).toHaveBeenCalled();
    });

    it('should throw EmailVerificationNotStartedException if verification not started', async () => {
      vi.spyOn(expirationStore, 'get').mockResolvedValue(null);

      await expect(
        emailVerificationService.verify('test@example.com', 123456),
      ).rejects.toThrow(EmailVerificationNotStartedException);
    });

    it('should throw EmailVerificationCodeInvalidException if code is invalid', async () => {
      const mockData: IEmailVerificationCodeData = {
        verificationCode: 123456,
      };

      vi.spyOn(expirationStore, 'checkIfExists').mockResolvedValue(true);
      vi.spyOn(expirationStore, 'get').mockResolvedValue(mockData);

      await expect(
        emailVerificationService.verify('test@example.com', 654321),
      ).rejects.toThrow(EmailVerificationCodeInvalidException);
    });
  });

  describe('getState', () => {
    it('should return NOT_STARTED if no verification data found', async () => {
      vi.spyOn(expirationStore, 'get').mockResolvedValue(null);

      const result = await emailVerificationService.getState('test@example.com');

      expect(result).toBe(EmailVerificationFlowState.NOT_STARTED);
    });

    it('should return STARTED_NOT_VERIFIED if verification started but not verified', async () => {
      const mockData: IEmailVerificationFlowData = {
        isVerified: false,
        email: 'test@example.com',
      };

      vi.spyOn(expirationStore, 'get').mockResolvedValue(mockData);

      const result = await emailVerificationService.getState('test@example.com');

      expect(result).toBe(EmailVerificationFlowState.STARTED_NOT_VERIFIED);
    });

    it('should return VERIFIED if ses-email is verified', async () => {
      const mockData: IEmailVerificationFlowData = {
        isVerified: true,
        email: 'test@example.com',
      };

      vi.spyOn(expirationStore, 'get').mockResolvedValue(mockData);

      const result = await emailVerificationService.getState('test@example.com');

      expect(result).toBe(EmailVerificationFlowState.VERIFIED);
    });
  });

  describe('resetFlow', () => {
    it('should reset the verification flow', async () => {
      vi.spyOn(expirationStore, 'delete').mockResolvedValue(true);

      const result = await emailVerificationService.resetFlow('test@example.com');

      expect(result).toBe(true);
      expect(expirationStore.delete).toHaveBeenCalledTimes(3);
    });
  });
});
