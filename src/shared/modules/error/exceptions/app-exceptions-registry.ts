import { HttpException, HttpStatus } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';

import {
  AppException,
  ERR_CODE_FLOW_ID_INDEX,
  TAppErrorCode,
} from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { IAppExceptionFlowRegistryOutput } from '@shared/modules/error/interfaces/exception-flow-registry-output.interface';
import { getAppExceptionDocHtml } from '@shared/modules/error/utils/get-app-exception-doc-html.util';
import { getConstructorName } from '@shared/modules/logger/utils/get-constructor-name.util';
import { TConstructor } from '@shared/types/constructor.type';

export class AppExceptionsRegistry {
  private exceptionFlowsRegistry = new Map<number, string>();
  private exceptionsRegistry = new Map<TAppErrorCode, AppException>();

  constructor() {
    // Register flow for common errors
    this.registerFlow(0, 'Common errors');

    for (const [name, code] of Object.entries(HttpStatus)) {
      if (typeof code !== 'number') {
        continue;
      }
      if (code < 400) {
        continue;
      }

      const description = this.getHttpExceptionDescription(name);
      const httpException = new HttpException(description, code);
      httpException.name = this.getHttpExceptionName(name);

      this.registerHttpException(httpException);
    }
  }

  registerFlow(flowCode: number, flowName: string): void {
    if (!Number.isSafeInteger(flowCode)) {
      throw new Error('flowCode should be safe integer');
    }

    const foundRegisteredFlow = this.exceptionFlowsRegistry.get(flowCode);

    if (foundRegisteredFlow) {
      const reservedCodes = this.exceptionFlowsRegistry.keys().toArray().sort();

      throw new Error(
        `Flow with code ${flowCode} already exists, existing flow name: ${foundRegisteredFlow}, ` +
          `reserved codes: ${JSON.stringify(reservedCodes)}`,
      );
    }

    this.exceptionFlowsRegistry.set(flowCode, flowName);
  }

  registerException(
    ExceptionConstructor: TConstructor<AppException | unknown> | AppException,
  ): void {
    const exception = isFunction(ExceptionConstructor)
      ? new ExceptionConstructor()
      : ExceptionConstructor;

    if (!(exception instanceof AppException)) {
      throw new Error(
        `Registered exception class should be constructor ` +
          `of AppException or its child, '${getConstructorName(exception)}' given insteadp`,
      );
    }

    const { errorCode } = exception;
    this.validateErrorCode(errorCode, exception);
    const flowId = errorCode.split('.').at(ERR_CODE_FLOW_ID_INDEX);

    if (!this.exceptionFlowsRegistry.has(Number(flowId))) {
      const messagePrefix = this.getValidationErrMsgPrefix(exception);

      throw new Error(
        `${messagePrefix} the flow with code '${flowId}' is not registered`,
      );
    }

    const foundRegisteredException = this.exceptionsRegistry.get(errorCode);

    if (foundRegisteredException) {
      const messagePrefix = this.getValidationErrMsgPrefix(exception);

      throw new Error(
        `${messagePrefix} exception with code ${errorCode} already exists, this is '${foundRegisteredException.name}'`,
      );
    }

    this.exceptionsRegistry.set(errorCode, exception);
  }

  registerHttpException(httpException: HttpException): void {
    const appException = AppException.fromHttpException(httpException);

    this.registerException(appException);
  }

  getRegistryObject(): IAppExceptionFlowRegistryOutput[] {
    const exceptionsByFlowIds = Map.groupBy(
      this.exceptionsRegistry.entries(),
      ([exceptionCode]) => {
        return exceptionCode.split('.').at(ERR_CODE_FLOW_ID_INDEX) ?? 'undefined';
      },
    );

    const result: IAppExceptionFlowRegistryOutput[] = [];

    for (const [code, name] of this.exceptionFlowsRegistry.entries()) {
      const flowExceptions = exceptionsByFlowIds.get(code.toString()) ?? [];

      result.push({
        name,
        code,
        exceptions: flowExceptions.map(([flowCode, exception]) => {
          return {
            code: flowCode,
            name: exception.name,
            description: exception.message,
          };
        }),
      });
    }

    result.sort((a, b) => a.code - b.code);

    return result;
  }

  getRegistryHtml(): string {
    const registryObject = this.getRegistryObject();

    return getAppExceptionDocHtml(registryObject);
  }

  private validateErrorCode(errorCode: string, exception: AppException): void {
    const errorCodeParts = errorCode.split('.');

    if (errorCodeParts.length !== 3) {
      const messagePrefix = this.getValidationErrMsgPrefix(exception);

      throw new Error(
        `${messagePrefix} error code should consist of 3 dot separated numbers, '${errorCode}' given instead`,
      );
    }

    const areAllCodePartsNumbers = errorCodeParts.every(errCodePart =>
      Number.isSafeInteger(Number(errCodePart)),
    );

    if (!areAllCodePartsNumbers) {
      const messagePrefix = this.getValidationErrMsgPrefix(exception);

      throw new Error(
        `${messagePrefix} error code should consist of 3 dot separated numbers, '${errorCode}' given instead`,
      );
    }
  }

  private getValidationErrMsgPrefix(exception: AppException): string {
    return `Failed to register '${exception.name}' (${exception.errorCode}):`;
  }

  private getHttpExceptionName(httpCodeKey: string): string {
    const pascalCaseName = this.screamingSnakeToPascalCase(httpCodeKey);

    return `${pascalCaseName}Exception`;
  }

  private getHttpExceptionDescription(httpCodeKey: string): string {
    const pascalCaseName = this.screamingSnakeToPascalCase(httpCodeKey, true);

    return `${pascalCaseName}`;
  }

  private screamingSnakeToPascalCase(str: string, withSpaces = false): string {
    let result = '';
    let capitalizeNext = true;

    for (const char of str) {
      if (char === '_') {
        capitalizeNext = true;
      } else {
        const space = withSpaces ? ' ' : '';
        result += capitalizeNext ? `${space}${char.toUpperCase()}` : char.toLowerCase();
        capitalizeNext = false;
      }
    }

    return result.trimStart();
  }
}

export const appExceptionsRegistry = new AppExceptionsRegistry();
