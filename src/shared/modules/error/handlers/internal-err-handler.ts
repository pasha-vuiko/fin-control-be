import { TErrorHandler } from '@shared/modules/error/decorators/catch.decorator';
import { AppLogger } from '@shared/modules/logger/app-logger';
import { getLogContext } from '@shared/modules/logger/utils/get-log-context.util';

/***
 *
 * @description Logs error
 */
export const internalErrHandler: TErrorHandler = (
  err: Error,
  methodContext: any,
  methodName = '',
  methodArgs = [],
) => {
  const logContext =
    getLogContext(methodContext, methodName, methodArgs) ?? 'internalErrHandler';
  const logger = new AppLogger(logContext);

  logger.error(err.message, err);
};
