/**
 * Linear interpolation
 */
export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const inverseLerp = (a: number, b: number, v: number): number => {
  return (v - a) / (b - a);
};

export const remap = (
  v: number,
  a: number,
  b: number,
  c: number,
  d: number
): number => {
  return lerp(c, d, inverseLerp(a, b, v));
};
