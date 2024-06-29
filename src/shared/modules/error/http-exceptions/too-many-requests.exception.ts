import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor(
    objectOrError?: string | object | any,
    descriptionOrOptions: string | HttpExceptionOptions = 'Too Many Requests',
  ) {
    const { description, httpExceptionOptions } =
      HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);

    const HTTP_STATUS = 429;

    super(
      HttpException.createBody(objectOrError, description ?? '', HTTP_STATUS),
      HTTP_STATUS,
      httpExceptionOptions,
    );
  }
}
