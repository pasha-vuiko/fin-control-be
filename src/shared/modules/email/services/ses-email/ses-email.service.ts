import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { Inject, Injectable } from '@nestjs/common';

import { EmailTemplateType } from '@shared/modules/email/enums/email-template-type.enum';
import { IEmailData } from '@shared/modules/email/interfaces/email-data.interface';
import { IEmailModuleOptions } from '@shared/modules/email/interfaces/email-module-options.interface';
import { IEmailService } from '@shared/modules/email/interfaces/email-service.interface';
import { EMAIL_MODULE_OPTIONS } from '@shared/modules/email/providers/email-module-options.provider';
import { TEmailPayload } from '@shared/modules/email/types/email-payload.type';

@Injectable()
export class SesEmailService implements IEmailService {
  private readonly sesClient: SESClient;

  constructor(@Inject(EMAIL_MODULE_OPTIONS) private options: IEmailModuleOptions) {
    this.sesClient = new SESClient({ region: options.ses.awsRegion });
  }

  async sendEmail(
    recipientEmail: string,
    payload: TEmailPayload,
    customSubject?: string,
  ): Promise<boolean> {
    const { subject, body } = this.getEmailData(payload);

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Body: {
          Text: {
            Data: body,
          },
        },
        Subject: {
          Data: customSubject ?? subject,
        },
      },
      Source: this.options.ses.senderEmail,
    });

    await this.sesClient.send(command).catch((err: Error) => {
      throw new Error('Failed to send an ses-email', { cause: err });
    });

    return true;
  }

  private getEmailData(payload: TEmailPayload): IEmailData {
    if (payload.type === EmailTemplateType.DEACTIVATE_ACCOUNT) {
      return {
        subject: 'Account deactivation verification',
        body: `Verification code: ${payload.body.code}`,
      };
    }
    if (payload.type === EmailTemplateType.REACTIVATE_ACCOUNT) {
      return {
        subject: 'Account reactivation verification',
        body: `Verification code: ${payload.body.code}`,
      };
    }

    throw new Error('No such ses-email type');
  }
}
