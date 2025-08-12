import { setTimeout as sleep } from 'node:timers/promises';

import { Logger } from '@shared/modules/logger/loggers/logger';

const logger = new Logger('execute-with-retries');

export async function executeWithRetries<T>(
  fn: () => Promise<T>,
  numberOfRetries: number,
  retryInterval?: number,
): Promise<T> {
  let lastError: Error;

  const inner = async (retryNumbersLeft: number): Promise<T> => {
    if (retryNumbersLeft <= 0) {
      throw lastError;
    }

    if (retryInterval) {
      await sleep(retryInterval);
    }

    try {
      return await fn();
    } catch (err: Error | any) {
      logger.verbose('execute with retry error', err);

      lastError = err;

      return await inner(retryNumbersLeft - 1);
    }
  };

  return await inner(numberOfRetries);
}
