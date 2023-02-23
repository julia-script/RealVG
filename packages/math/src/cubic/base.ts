import { lerp } from "../utils/lerp";
import { fill } from "lodash";
import { CubicSequence, Point } from "../types";

export const getVectors = (curve: CubicSequence): QuadraticSequence => {
  const [
    point0X,
    point0Y,

    point1X,
    point1Y,

    point2X,
    point2Y,

    point3X,
    point3Y,
  ] = curve;

  // Vector from point0 to point1
  const v1x = point1X - point0X;
  const v1y = point1Y - point0Y;

  // Vector from point1 to point2
  const v2x = point2X - point1X;
  const v2y = point2Y - point1Y;

  // Vector from point2 to point3
  const v3x = point3X - point2X;
  const v3y = point3Y - point2Y;

  return [v1x, v1y, v2x, v2y, v3x, v3y];
};

export const getCoefficients = (curve: CubicSequence): CubicSequence => {
  const [v1x, v1y, v2x, v2y, v3x, v3y] = getVectors(curve);

  const ax = v3x - v2x - v2x + v1x;
  const ay = v3y - v2y - v2y + v1y;

  const bx = 3.0 * (v2x - v1x);
  const by = 3.0 * (v2y - v1y);

  const cx = 3.0 * v1x;
  const cy = 3.0 * v1y;

  return [ax, ay, bx, by, cx, cy, curve[0], curve[1]];
};

export const getDerivativeCoefficients = (
  curve: CubicSequence
): QuadraticSequence => {
  const [ax, ay, bx, by, cx, cy] = getCoefficients(curve);

  const dax = 3.0 * ax;
  const day = 3.0 * ay;

  const dbx = 2.0 * bx;
  const dby = 2.0 * by;

  const dcx = cx;
  const dcy = cy;

  return [dax, day, dbx, dby, dcx, dcy];
};

export const evalT = (curve: CubicSequence, t: number): Point => {
  const [ax, ay, bx, by, cx, cy, dx, dy] = getCoefficients(curve);

  const x = ((ax * t + bx) * t + cx) * t + dx;
  const y = ((ay * t + by) * t + cy) * t + dy;

  return [x, y];
};

export const evalIndependentT = (
  curve: CubicSequence,
  tPoint: Point
): Point => {
  const [tx, ty] = tPoint;
  const [
    point0X,
    point0Y,

    point1X,
    point1Y,

    point2X,
    point2Y,

    point3X,
    point3Y,
  ] = curve;
  let p01x = lerp(point0X, point1X, tx);
  let p01y = lerp(point0Y, point1Y, ty);

  let p12x = lerp(point1X, point2X, tx);
  let p12y = lerp(point1Y, point2Y, ty);

  let p23x = lerp(point2X, point3X, tx);
  let p23y = lerp(point2Y, point3Y, ty);

  let x = lerp(lerp(p01x, p12x, tx), lerp(p12x, p23x, tx), tx);
  let y = lerp(lerp(p01y, p12y, ty), lerp(p12y, p23y, ty), ty);

  return [x, y];
};
