import { HttpException, HttpExceptionOptions } from '@nestjs/common';

export class PreconditionRequiredException extends HttpException {
  constructor(
    objectOrError?: string | object | any,
    descriptionOrOptions: string | HttpExceptionOptions = 'Precondition Required',
  ) {
    const { description, httpExceptionOptions } =
      HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);

    const HTTP_STATUS = 428;

    super(
      HttpException.createBody(objectOrError, description ?? '', HTTP_STATUS),
      HTTP_STATUS,
      httpExceptionOptions,
    );
  }
}
