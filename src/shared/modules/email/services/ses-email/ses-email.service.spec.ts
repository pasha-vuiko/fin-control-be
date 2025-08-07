import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { afterEach, describe } from 'vitest';

import { EmailTemplateType } from '@shared/modules/email/enums/email-template-type.enum';
import { IEmailModuleOptions } from '@shared/modules/email/interfaces/email-module-options.interface';

import { getMockedInstance } from '../../../../../../test/utils/get-mocked-instance.util';
import { SesEmailService } from './ses-email.service';

// eslint-disable-next-line max-lines-per-function
describe('SesEmailService', () => {
  let emailService: SesEmailService;
  let sesClient: SESClient;

  beforeEach(async () => {
    emailService = new SesEmailService({ ses: {} } as IEmailModuleOptions);
    sesClient = getMockedInstance(SESClient);
    //@ts-expect-error access to private field
    emailService.sesClient = sesClient;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  // eslint-disable-next-line max-lines-per-function
  describe('sendEmail()', () => {
    it('should send an ses-email successfully', async () => {
      const sendSpy = vi.spyOn(sesClient, 'send').mockResolvedValue({} as any);

      const recipientEmail = 'recipient@example.com';
      const payload = {
        type: EmailTemplateType.DEACTIVATE_ACCOUNT,
        body: { code: 123456 },
      };

      const result = await emailService.sendEmail(recipientEmail, payload);

      expect(result).toBe(true);
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(SendEmailCommand));
    });

    it('should throw an error for unsupported ses-email type', async () => {
      const recipientEmail = 'recipient@example.com';
      const payload = {
        type: 'UNSUPPORTED_TYPE' as EmailTemplateType,
        body: { code: 123456 },
      };

      await expect(emailService.sendEmail(recipientEmail, payload)).rejects.toThrow(
        'No such ses-email type',
      );
    });

    it('should throw an error if sending ses-email fails', async () => {
      const sendSpy = vi
        .spyOn(sesClient, 'send')
        .mockRejectedValue(new Error('AWS SES error'));

      const recipientEmail = 'recipient@example.com';
      const payload = {
        type: EmailTemplateType.DEACTIVATE_ACCOUNT,
        body: { code: 123456 },
      };

      await expect(emailService.sendEmail(recipientEmail, payload)).rejects.toThrow(
        'Failed to send an ses-email',
      );
      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(SendEmailCommand));
    });
  });
});
