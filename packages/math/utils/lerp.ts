/**
 * Linear interpolation
 */
export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};
