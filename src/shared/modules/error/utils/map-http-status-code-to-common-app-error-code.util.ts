import { TAppErrorCode } from '@shared/modules/error/exceptions/exception-classes/app.exception';

export function mapHttpStatusCodeToCommonAppErrorCode(httpCode: number): TAppErrorCode {
  return `${httpCode}.0.0`;
}
