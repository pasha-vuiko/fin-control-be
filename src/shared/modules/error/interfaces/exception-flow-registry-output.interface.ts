export interface AppExceptionFlowRegistryOutput {
  name: string;
  code: number;
  exceptions: AppExceptionRegistryOutput[];
}

export interface AppExceptionRegistryOutput {
  code: string;
  name: string;
  description: string;
}
