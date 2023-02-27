/**
 * A representation of a single point. Could represent a point in 2D space, a vector or a size for example.
 */
export type Point = [number, number];
/**
 * A sequence of 4 points, may or may not be interpreted as a cubic curve, depending on the context.
 */
export type Points4 = [
  point0X: number,
  point0Y: number,
  point1X: number,
  point1Y: number,
  point2X: number,
  point2Y: number,
  point3X: number,
  point3Y: number
];

/**
 * A sequence of 3 points, may or may not be a quadratic curve, depending on the context.
 */
export type Points3 = [
  point0X: number,
  point0Y: number,
  point1X: number,
  point1Y: number,
  point2X: number,
  point2Y: number
];

/**
 * A sequence of 2 points, may or may not be a line, depending on the context.
 */
export type Points2 = [
  point0X: number,
  point0Y: number,
  point1X: number,
  point1Y: number
];
