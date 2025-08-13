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

/**
 * Central registry for application exceptions and exception flows.
 *
 * The registry keeps two maps:
 * - `exceptionFlowsRegistry`: maps a numeric **flow code** to a human‑readable flow name (e.g., `0 -> "Common errors"`).
 * - `exceptionsRegistry`: maps a **TAppErrorCode** to its corresponding {@link AppException} instance.
 *
 * ## Error code format
 * Error codes are 3 dot‑separated integers: `<flowId>.<httpStatus>.<errorId>`.
 *  - `flowId` (`ERR_CODE_FLOW_ID_INDEX = 0`) — logical group of errors (must be registered first).
 *  - `httpStatus` (`ERR_CODE_HTTP_STATUS_INDEX = 1`) — HTTP status code the error conforms to.
 *  - `errorId` (`ERR_CODE_ERR_ID_INDEX = 2`) — unique local identifier within the flow + status.
 *
 * ## Built‑ins
 * On construction the registry:
 *  - Registers flow `0` as **Common errors**.
 *  - Registers an {@link AppException} for every {@link HttpStatus} with code \>= 400, using
 *    the status name to derive exception `name` and default `message`.
 *
 * ## Typical usage
 * ```ts
 * // 1) Define your exception extending AppException with a fixed errorCode
 * class UserNotFoundException extends AppException {
 *   constructor() {
 *     super('User not found', { errorCode: '1.404.1', name: 'UserNotFoundException' });
 *   }
 * }
 *
 * // 2) Register a flow (once at bootstrap) and then register the exception
 * appExceptionsRegistry.registerFlow(1, 'Users');
 * appExceptionsRegistry.registerException(UserNotFoundException);
 *
 * // 3) Use the exception in your code
 * throw new UserNotFoundException();
 * ```
 */
export class AppExceptionsRegistry {
  private readonly exceptionFlowsRegistry = new Map<number, string>();
  private readonly exceptionsRegistry = new Map<TAppErrorCode, AppException>();

  /**
   * Initializes the registry with a default flow and HTTP‑derived exceptions.
   *
   * - Registers flow `0` as "Common errors".
   * - Iterates over {@link HttpStatus} entries and registers an {@link AppException}
   *   for each status code \>= 400.
   */
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

  /**
   * Registers a new logical flow for grouping exceptions.
   *
   * @param flowCode A safe integer identifying the flow (e.g., `1`).
   * @param flowName Human‑readable name of the flow.
   * @throws {Error} If `flowCode` is not a safe integer or already registered.
   */
  registerFlow(flowCode: number, flowName: string): void {
    if (!Number.isSafeInteger(flowCode)) {
      throw new Error('flowCode should be safe integer');
    }

    const foundRegisteredFlow = this.exceptionFlowsRegistry.get(flowCode);

    if (foundRegisteredFlow) {
      const reservedCodes = this.exceptionFlowsRegistry
        .keys()
        .toArray()
        .sort((a, b) => a - b);

      throw new Error(
        `Flow with code ${flowCode} already exists, existing flow name: ${foundRegisteredFlow}, ` +
          `reserved codes: ${JSON.stringify(reservedCodes)}`,
      );
    }

    this.exceptionFlowsRegistry.set(flowCode, flowName);
  }

  /**
   * Registers an {@link AppException} in the registry.
   *
   * You can pass either the exception **class/constructor** (it will be instantiated without args)
   * or an already **constructed instance**.
   *
   * Validation rules:
   *  - The instance must extend {@link AppException}.
   *  - `errorCode` must follow the `flowId.httpStatus.errorId` format and refer to an existing flow.
   *  - The `errorCode` must be unique across the registry.
   *
   * @param ExceptionConstructor The exception constructor or instance.
   * @throws {Error} If the instance is not an `AppException`, the error code format is invalid,
   *                 its flow is not registered, or the error code is already taken.
   */
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

  /**
   * Convenience wrapper to register a Nest {@link HttpException} as an {@link AppException}.
   *
   * @param httpException A concrete `HttpException` to convert and register.
   */
  registerHttpException(httpException: HttpException): void {
    const appException = AppException.fromHttpException(httpException);

    this.registerException(appException);
  }

  /**
   * Builds a serializable view of the registry grouped by flow.
   *
   * @returns An array of flow descriptors with their registered exceptions, sorted by `flow.code`.
   */
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

  /**
   * Produces an HTML document describing all registered flows and exceptions.
   *
   * @returns HTML string suitable for rendering or exporting as docs.
   */
  getRegistryHtml(): string {
    const registryObject = this.getRegistryObject();

    return getAppExceptionDocHtml(registryObject);
  }

  /**
   * Validates that an exception `errorCode` matches the `x.y.z` numeric format.
   *
   * @param errorCode The code to validate.
   * @param exception The exception owning this code (used for clear error messages).
   * @throws {Error} If the code does not contain exactly three numeric parts.
   */
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

  /**
   * Builds a common prefix used in validation error messages for consistent wording.
   */
  private getValidationErrMsgPrefix(exception: AppException): string {
    return `Failed to register '${exception.name}' (${exception.errorCode}):`;
  }

  /**
   * Converts an `HttpStatus` SCREAMING_SNAKE key to a PascalCase exception class name
   * (e.g., `NOT_FOUND` -> `NotFoundException`).
   */
  private getHttpExceptionName(httpCodeKey: string): string {
    const pascalCaseName = this.screamingSnakeToPascalCase(httpCodeKey);

    return `${pascalCaseName}Exception`;
  }

  /**
   * Converts an `HttpStatus` SCREAMING_SNAKE key to a human‑readable message
   * with spaces (e.g., `NOT_FOUND` -> `Not Found`).
   */
  private getHttpExceptionDescription(httpCodeKey: string): string {
    const pascalCaseName = this.screamingSnakeToPascalCase(httpCodeKey, true);

    return `${pascalCaseName}`;
  }

  /**
   * Transforms a SCREAMING_SNAKE_CASE string into PascalCase or spaced title case.
   *
   * @param str Input in SCREAMING_SNAKE_CASE.
   * @param withSpaces If `true`, inserts spaces instead of removing underscores.
   * @returns `PascalCase` when `withSpaces` is `false`, or `Title Case` when `true`.
   */
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
