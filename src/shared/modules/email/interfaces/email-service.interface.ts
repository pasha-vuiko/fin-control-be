import { TEmailPayload } from '@shared/modules/email/types/email-payload.type';

export interface IEmailService {
  sendEmail(
    recipientEmail: string,
    payload: TEmailPayload,
    customSubject?: string,
  ): Promise<boolean>;
}
