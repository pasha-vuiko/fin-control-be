import { TErrorHandler } from '@shared/modules/error/decorators/catch.decorator';
import { Logger } from '@shared/modules/logger/loggers/logger';
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
  const logger = new Logger(logContext);

  logger.error(err.message, err);
};
