import { EmailTemplateType } from '@shared/modules/email/enums/email-template-type.enum';

export type TEmailPayload = IDeactivateAccountVerificationEmail;

export interface IDeactivateAccountVerificationEmail {
  type: EmailTemplateType;
  body: {
    code: number;
  };
}
