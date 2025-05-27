import { Prisma } from '@prisma-definitions/client';
import { PrismaError } from 'prisma-error-enum';

import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { TErrorHandler } from '@shared/modules/error/decorators/catch-errors/catch-errors.decorator';
import { Logger } from '@shared/modules/logger/loggers/logger';
import { getLogContext } from '@shared/modules/logger/utils/get-log-context.util';

import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError;

export const handlePrismaError: TErrorHandler = (
  err,
  methodContext,
  methodName,
  methodArgs,
) => {
  const logContext =
    getLogContext(methodContext, methodName, methodArgs) ?? `handlePrismaError`;
  const logger = new Logger(logContext);

  if (!(err instanceof PrismaClientKnownRequestError)) {
    throw err;
  }

  handlePrismaClientKnownRequestError(err, logger);
};

// eslint-disable-next-line max-lines-per-function
function handlePrismaClientKnownRequestError(
  err: PrismaClientKnownRequestError,
  logger: Logger,
): void {
  switch (err.code) {
    case PrismaError.UniqueConstraintViolation:
      throw new ConflictException(
        `Record with these fields: [${err?.meta?.target}] already exists`,
        {
          cause: err,
        },
      );
    case PrismaError.RecordDoesNotExist:
      throw new NotFoundException('Record does not exist', { cause: err });
    case PrismaError.RecordsNotFound:
      throw new NotFoundException('Record is not found', { cause: err });
    case PrismaError.ConnectionTimedOut:
      throw new RequestTimeoutException('Connection to DB is timed out', { cause: err });
    case PrismaError.OperationsTimedOut:
      throw new RequestTimeoutException('Operation on DB is timed out', { cause: err });
    case PrismaError.TLSConnectionError:
      throw new ServiceUnavailableException('DB TLS connection error', { cause: err });
    case PrismaError.ValueTooLongForColumnType: {
      // TODO add more info about the field that is too long
      throw new BadRequestException('Value is too long for column type', { cause: err });
    }
    case PrismaError.InvalidValue: {
      // TODO add more info about the field that is invalid
      throw new BadRequestException('Invalid value', { cause: err });
    }
    case PrismaError.ValidationError: {
      // TODO add more info about the field that is invalid
      throw new BadRequestException('Validation error', { cause: err });
    }
    case PrismaError.QueryParsingError: {
      // TODO add more info about the field that is invalid
      throw new InternalServerErrorException('Query parsing error', { cause: err });
    }
    case PrismaError.QueryValidationError: {
      // TODO add more info about the field that is invalid
      throw new InternalServerErrorException('Query validation error', { cause: err });
    }
    case PrismaError.NullConstraintViolation: {
      // TODO add more info about the field that is invalid
      throw new BadRequestException('Null constraint violation', { cause: err });
    }
    default: {
      logger.error(err.message, err);
      throw new InternalServerErrorException('Unknown DB error', { cause: err });
    }
  }
}
