export interface IEmailModuleOptions {
  ses: IEmailSesOptions;
}

export interface IEmailSesOptions {
  awsRegion: string;
  senderEmail: string;
}
