import { HttpStatus } from '@nestjs/common';

import { RegisterAppException } from '@shared/modules/error/decorators/register-app-exception/register-app-exception.decprator';
import { appExceptionsRegistry } from '@shared/modules/error/exceptions/app-exceptions-registry';
import { AppException } from '@shared/modules/error/exceptions/exception-classes/app.exception';
import { createErrCode } from '@shared/modules/error/utils/create-err-code.util';

const FLOW_ID = 5;

appExceptionsRegistry.registerFlow(FLOW_ID, 'Database');

export class DatabaseException extends AppException {}

// Prisma Errors
@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.CONFLICT, 0),
  'Unique constraint violation',
)
export class UniqueConstraintViolationException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.NOT_FOUND, 0),
  'Record does not exist',
)
export class RecordDoesNotExistException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.NOT_FOUND, 1),
  'Record is not found',
)
export class RecordsNotFoundException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.REQUEST_TIMEOUT, 0),
  'Connection to database timed out',
)
export class ConnectionTimedOutException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.REQUEST_TIMEOUT, 1),
  'Database operation timed out',
)
export class OperationsTimedOutException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.SERVICE_UNAVAILABLE, 0),
  'Database TLS connection error',
)
export class TLSConnectionErrorException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 0),
  'Value is too long for column type',
)
export class ValueTooLongForColumnTypeException extends DatabaseException {}

@RegisterAppException(createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 1), 'Invalid value')
export class InvalidValueException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 2),
  'Validation error',
)
export class ValidationErrorException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.INTERNAL_SERVER_ERROR, 0),
  'Query parsing error',
)
export class QueryParsingErrorException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.INTERNAL_SERVER_ERROR, 1),
  'Query validation error',
)
export class QueryValidationErrorException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 3),
  'Null constraint violation',
)
export class NullConstraintViolationException extends DatabaseException {}

// PostgreSQL Errors
@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 4),
  'Foreign key constraint violation',
)
export class ForeignKeyViolationException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 5),
  'Not null constraint violation',
)
export class NotNullViolationException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 6),
  'Check constraint violation',
)
export class CheckViolationException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.SERVICE_UNAVAILABLE, 1),
  'Database connection error',
)
export class ConnectionFailureException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.SERVICE_UNAVAILABLE, 2),
  'Insufficient database resources',
)
export class InsufficientResourcesException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 7),
  'Invalid data format or value',
)
export class InvalidDataFormatException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 8),
  'Division by zero error',
)
export class DivisionByZeroException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.BAD_REQUEST, 9),
  'Invalid query or insufficient privileges',
)
export class SyntaxErrorOrInsufficientPrivilegeException extends DatabaseException {}

@RegisterAppException(
  createErrCode(FLOW_ID, HttpStatus.INTERNAL_SERVER_ERROR, 2),
  'Unknown database error',
)
export class UnknownDatabaseErrorException extends DatabaseException {}
