export const copySign = (n: number, sign: number) => {
  return Math.sign(n) === Math.sign(sign) ? n : -n;
};
