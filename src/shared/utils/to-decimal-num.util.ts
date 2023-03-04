export function toDecimalNum(num: number): number {
  const strNum = num.toFixed(2);

  return Number(strNum);
}
