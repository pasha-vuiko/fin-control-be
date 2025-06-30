import { Prisma } from '@prisma-definitions/client';
import { DrizzleQueryError } from 'drizzle-orm/errors';
import { DatabaseError as PgDatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';
import { PrismaError } from 'prisma-error-enum';

import { TErrorHandler } from '@shared/modules/error/decorators/catch-errors/catch-errors.decorator';
import { Logger } from '@shared/modules/logger/loggers/logger';
import { getLogContext } from '@shared/modules/logger/utils/get-log-context.util';
import {
  CheckViolationException,
  ConnectionFailureException,
  ConnectionTimedOutException,
  DivisionByZeroException,
  ForeignKeyViolationException,
  InsufficientResourcesException,
  InvalidDataFormatException,
  InvalidValueException,
  NotNullViolationException,
  NullConstraintViolationException,
  OperationsTimedOutException,
  QueryParsingErrorException,
  QueryValidationErrorException,
  RecordDoesNotExistException,
  RecordsNotFoundException,
  SyntaxErrorOrInsufficientPrivilegeException,
  TLSConnectionErrorException,
  UniqueConstraintViolationException,
  UnknownDatabaseErrorException,
  ValidationErrorException,
  ValueTooLongForColumnTypeException,
} from '@shared/modules/prisma/exceptions/exception-classes';

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

  if (err instanceof PrismaClientKnownRequestError) {
    handlePrismaClientKnownRequestError(err, logger);
  }
  if (err instanceof PgDatabaseError) {
    handlePgDatabaseError(err, logger);
  }
  if (err instanceof DrizzleQueryError) {
    handleDrizzleQueryError(err, logger);
  }

  throw err;
};

// eslint-disable-next-line max-lines-per-function
function handlePrismaClientKnownRequestError(
  err: PrismaClientKnownRequestError,
  logger: Logger,
): void {
  switch (err.code) {
    case PrismaError.UniqueConstraintViolation:
      throw new UniqueConstraintViolationException(
        `Record with these fields: [${err?.meta?.target}] already exists`,
        {
          cause: err,
        },
      );
    case PrismaError.RecordDoesNotExist:
      throw new RecordDoesNotExistException('Record does not exist', { cause: err });
    case PrismaError.RecordsNotFound:
      throw new RecordsNotFoundException('Record is not found', { cause: err });
    case PrismaError.ConnectionTimedOut:
      throw new ConnectionTimedOutException('Connection to DB is timed out', {
        cause: err,
      });
    case PrismaError.OperationsTimedOut:
      throw new OperationsTimedOutException('Operation on DB is timed out', {
        cause: err,
      });
    case PrismaError.TLSConnectionError:
      throw new TLSConnectionErrorException('DB TLS connection error', { cause: err });
    case PrismaError.ValueTooLongForColumnType: {
      const targetField = Array.isArray(err.meta?.target)
        ? err.meta?.target.join(', ')
        : (err.meta?.target ?? 'unknown field');
      throw new ValueTooLongForColumnTypeException(
        `Value is too long for column type in: [${targetField}]`,
        { cause: err },
      );
    }
    case PrismaError.InvalidValue: {
      const fieldName = err.meta?.field_name || err.meta?.target || 'unknown field';
      throw new InvalidValueException(`Invalid value in: [${fieldName}]`, {
        cause: err,
      });
    }
    case PrismaError.ValidationError: {
      const fieldName = err.meta?.field_name || err.meta?.target || 'unknown field';
      throw new ValidationErrorException(`Validation error in: [${fieldName}]`, {
        cause: err,
      });
    }
    case PrismaError.QueryParsingError: {
      const query = err.meta?.query || 'unknown query';
      throw new QueryParsingErrorException(`Query parsing error in: ${query}`, {
        cause: err,
      });
    }
    case PrismaError.QueryValidationError: {
      const query = err.meta?.query || 'unknown query';
      throw new QueryValidationErrorException(`Query validation error in: ${query}`, {
        cause: err,
      });
    }
    case PrismaError.NullConstraintViolation: {
      const fieldName = err.meta?.field_name || err.meta?.target || 'unknown field';
      throw new NullConstraintViolationException(
        `Null constraint violation in: [${fieldName}]`,
        { cause: err },
      );
    }
    default: {
      logger.error(err.message, err);
      throw new UnknownDatabaseErrorException('Unknown DB error', { cause: err });
    }
  }
}

// eslint-disable-next-line max-lines-per-function
function handlePgDatabaseError(err: PgDatabaseError, logger: Logger): void {
  switch (err.code) {
    // Unique constraint violation
    case PostgresError.UNIQUE_VIOLATION:
      throw new UniqueConstraintViolationException(
        `Record with these fields already exists`,
        {
          cause: err,
        },
      );
    // Foreign key constraint violation
    case PostgresError.FOREIGN_KEY_VIOLATION:
      throw new ForeignKeyViolationException('Foreign key constraint violation', {
        cause: err,
      });
    // Not null constraint violation
    case PostgresError.NOT_NULL_VIOLATION:
      throw new NotNullViolationException('Not null constraint violation', {
        cause: err,
      });
    // Check constraint violation
    case PostgresError.CHECK_VIOLATION:
      throw new CheckViolationException('Check constraint violation', { cause: err });
    // Connection exceptions
    case PostgresError.CONNECTION_FAILURE:
    case PostgresError.CONNECTION_EXCEPTION:
      throw new ConnectionFailureException('Database connection error', { cause: err });
    // Insufficient resources
    case PostgresError.INSUFFICIENT_RESOURCES:
      throw new InsufficientResourcesException('Insufficient database resources', {
        cause: err,
      });
    // Query timeout
    case PostgresError.QUERY_CANCELED:
      throw new OperationsTimedOutException('Database query timed out', { cause: err });
    // Data exceptions
    case PostgresError.NUMERIC_VALUE_OUT_OF_RANGE:
    case PostgresError.STRING_DATA_RIGHT_TRUNCATION:
    case PostgresError.INVALID_TEXT_REPRESENTATION:
    case PostgresError.INVALID_DATETIME_FORMAT:
      throw new InvalidDataFormatException('Invalid data format or value', {
        cause: err,
      });
    // Division by zero
    case PostgresError.DIVISION_BY_ZERO:
      throw new DivisionByZeroException('Division by zero error', { cause: err });
    // Syntax error or access rule violation
    case PostgresError.SYNTAX_ERROR:
    case PostgresError.INSUFFICIENT_PRIVILEGE:
      throw new SyntaxErrorOrInsufficientPrivilegeException(
        'Invalid query or insufficient privileges',
        {
          cause: err,
        },
      );
    // Default case for unhandled errors
    default:
      logger.error(`Unhandled PostgreSQL error: ${err.code}`, err);
      throw new UnknownDatabaseErrorException('Database error', { cause: err });
  }
}

function handleDrizzleQueryError(err: DrizzleQueryError, logger: Logger): void {
  if (err.cause instanceof PgDatabaseError) {
    return handlePgDatabaseError(err.cause, logger);
  }

  logger.error('Unhandled Drizzle error', err);
  throw new UnknownDatabaseErrorException('Database error', { cause: err });
}
