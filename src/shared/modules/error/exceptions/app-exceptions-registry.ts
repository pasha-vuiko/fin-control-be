import {
  AppException,
  TAppErrorCode,
} from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { TConstructor } from '@shared/types/constructor.type';

export class AppExceptionsRegistry {
  private exceptionFlowsRegistry = new Map<number, string>();
  private exceptionsRegistry = new Map<TAppErrorCode, AppException>();

  registerFlow(flowCode: number, flowName: string): void {
    if (!Number.isSafeInteger(flowCode)) {
      throw new Error('flowCode should be safe integer');
    }

    const foundRegisteredFlow = this.exceptionFlowsRegistry.get(flowCode);

    if (foundRegisteredFlow) {
      throw new Error(
        `Flow with code ${flowCode} already exists, existing flow name: ${foundRegisteredFlow}`,
      );
    }

    this.exceptionFlowsRegistry.set(flowCode, flowName);
  }

  registerException(ExceptionConstructor: TConstructor<AppException | unknown>): void {
    const exception = new ExceptionConstructor();

    if (!(exception instanceof AppException)) {
      throw new Error(
        'Registered exception class should be constructor of AppException or its child',
      );
    }

    const { errorCode } = exception;

    const foundRegisteredException = this.exceptionsRegistry.get(errorCode);

    if (foundRegisteredException) {
      throw new Error(
        `Exception with code ${errorCode} already exists, this is '${foundRegisteredException.name}'`,
      );
    }

    this.exceptionsRegistry.set(errorCode, exception);
  }

  // TODO Add methods to export registry
}

export const appExceptionsRegistry = new AppExceptionsRegistry();
