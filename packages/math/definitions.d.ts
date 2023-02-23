/**
 * A representation of a single point. Could represent a point in 2D space, a vector or a size for example.
 */
type Point = [number, number];
/**
 * A sequence of 4 points, may or may not be interpreted as a cubic curve, depending on the context.
 */
type CubicSequence = [
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
type QuadraticSequence = [
  point0X: number,
  point0Y: number,
  point1X: number,
  point1Y: number,
  point2X: number,
  point2Y: number
];
