import { TConstructor } from '@shared/types/constructor.type';

export function rethrowError<E extends Error>(err: E): RethrowErrorService {
  return new RethrowErrorService(err);
}

// TODO Add ability to return value instead of throwing of an error
class ThrowErrorWhenService {
  constructor(
    private rethrowService: RethrowErrorService,
    private InputErrorConstructor: TConstructor<Error>,
  ) {}

  throw(error: Error): RethrowErrorService;
  throw(ErrorConstructor: TConstructor<Error>): RethrowErrorService;
  throw(ErrorConstructor: TConstructor<Error>, message: string): RethrowErrorService;
  throw(
    errorOrConstructor: Error | TConstructor<Error>,
    message?: string,
  ): RethrowErrorService {
    if (errorOrConstructor instanceof Error) {
      this.rethrowService.setErrRethrow(this.InputErrorConstructor, errorOrConstructor);

      return this.rethrowService;
    }

    if (message) {
      this.rethrowService.setErrRethrow(
        this.InputErrorConstructor,
        new errorOrConstructor(message),
      );

      return this.rethrowService;
    }

    this.rethrowService.setErrRethrow(
      this.InputErrorConstructor,
      new errorOrConstructor(),
    );

    return this.rethrowService;
  }
}

class RethrowErrorService {
  private errRethrowMap = new Map<TConstructor<Error>, Error>();

  constructor(private error: Error) {}

  when(ErrorConstructor: TConstructor<Error>): ThrowErrorWhenService {
    return new ThrowErrorWhenService(this, ErrorConstructor);
  }

  setErrRethrow(ErrorConstructor: TConstructor<Error>, error: Error): this {
    this.errRethrowMap.set(ErrorConstructor, error);

    return this;
  }

  run(): never {
    for (const [ErrorConstructor, errToThrow] of this.errRethrowMap.entries()) {
      if (this.error instanceof ErrorConstructor) {
        errToThrow.cause = this.error;

        throw errToThrow;
      }
    }

    throw this.error;
  }
}
