export interface IAppExceptionFlowRegistryOutput {
  name: string;
  code: number;
  exceptions: IAppExceptionRegistryOutput[];
}

export interface IAppExceptionRegistryOutput {
  code: string;
  name: string;
  description: string;
}
