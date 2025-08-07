import crypto from 'node:crypto';

export function generateRandomNum(numberOfDigits = 6): number {
  const min = 10 ** (numberOfDigits - 1);
  const max = 10 ** numberOfDigits - 1;

  return crypto.randomInt(min, max);
}
