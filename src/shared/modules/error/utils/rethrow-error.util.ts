import { TConstructor } from '@shared/types/constructor.type';

/**
 * Creates a fluent mapper that rethrows a source error as another error type.
 *
 * The mapper compares error constructors using `instanceof`. If a mapping matches, it throws
 * the mapped error and sets its `cause` to the original error. If no mapping matches, it
 * throws the original error unchanged.
 *
 * @param err - Original error to remap.
 * @returns A fluent API to configure mappings and execute rethrow.
 *
 * @example
 * ```ts
 * try {
 *   await repo.create(input);
 * } catch (err) {
 *   rethrowError(err as Error)
 *     .when(DbUniqueViolationError)
 *     .throw(UserAlreadyExistsException, 'User already exists')
 *     .run();
 * }
 * ```
 *
 * @example
 * ```ts
 * try {
 *   await service.handle();
 * } catch (err) {
 *   rethrowError(err as Error)
 *     .when(UnauthorizedError)
 *     .throw(new ForbiddenError('Access denied'))
 *     .run();
 * }
 * ```
 *
 * @example
 * ```ts
 * // If no mapping matches, the original error is thrown.
 * rethrowError(err as Error).when(ValidationError).throw(BadRequestError).run();
 * ```
 */
export function rethrowError<E extends Error>(err: E): RethrowErrorService {
  return new RethrowErrorService(err);
}

/**
 * Fluent step that defines what should be thrown when input error type matches.
 */
class ThrowErrorWhenService {
  constructor(
    private readonly rethrowService: RethrowErrorService,
    private readonly InputErrorConstructor: TConstructor<Error>,
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

/**
 * Fluent mapper for configuring error remapping and executing rethrow.
 */
class RethrowErrorService {
  private readonly errRethrowMap = new Map<TConstructor<Error>, Error>();

  constructor(private readonly error: Error) {}

  /**
   * Selects an input error type to match with `instanceof`.
   */
  when(ErrorConstructor: TConstructor<Error>): ThrowErrorWhenService {
    return new ThrowErrorWhenService(this, ErrorConstructor);
  }

  setErrRethrow(ErrorConstructor: TConstructor<Error>, error: Error): this {
    this.errRethrowMap.set(ErrorConstructor, error);

    return this;
  }

  /**
   * Executes the configured mappings and always throws.
   *
   * @throws {Error} Rethrown mapped error with `cause`, or the original error.
   */
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
