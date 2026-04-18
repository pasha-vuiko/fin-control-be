/**
 * Transforms a SCREAMING_SNAKE_CASE string into PascalCase or spaced title case.
 *
 * @param str Input in SCREAMING_SNAKE_CASE.
 * @param withSpaces If `true`, inserts spaces instead of removing underscores.
 * @returns `PascalCase` when `withSpaces` is `false`, or `Title Case` when `true`.
 */
export function screamingSnakeToPascalCase(str: string, withSpaces = false): string {
  let result = '';
  let capitalizeNext = true;

  for (const char of str) {
    if (char === '_') {
      capitalizeNext = true;
    } else {
      const space = withSpaces ? ' ' : '';
      result += capitalizeNext ? `${space}${char.toUpperCase()}` : char.toLowerCase();
      capitalizeNext = false;
    }
  }

  return result.trimStart();
}
