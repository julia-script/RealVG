import { lerp } from "../utils";
import { fill, max } from "lodash";
import { Points4, Points2, Point, Points3 } from "../types";

export const getVectors = (curve: Points4): Points3 => {
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

export const getCoefficients = (curve: Points4): Points4 => {
  const [v1x, v1y, v2x, v2y, v3x, v3y] = getVectors(curve);

  const ax = v3x - v2x - v2x + v1x;
  const ay = v3y - v2y - v2y + v1y;

  const bx = 3.0 * (v2x - v1x);
  const by = 3.0 * (v2y - v1y);

  const cx = 3.0 * v1x;
  const cy = 3.0 * v1y;

  return [ax, ay, bx, by, cx, cy, curve[0], curve[1]];
};

export const getDerivativeCoefficients = (curve: Points4): Points3 => {
  const [ax, ay, bx, by, cx, cy] = getCoefficients(curve);

  const dax = 3.0 * ax;
  const day = 3.0 * ay;

  const dbx = 2.0 * bx;
  const dby = 2.0 * by;

  const dcx = cx;
  const dcy = cy;

  return [dax, day, dbx, dby, dcx, dcy];
};

export const evalT = (curve: Points4, t: number): Point => {
  const [ax, ay, bx, by, cx, cy, dx, dy] = getCoefficients(curve);

  const x = ((ax * t + bx) * t + cx) * t + dx;
  const y = ((ay * t + by) * t + cy) * t + dy;

  return [x, y];
};

export const evalIndependentT = (curve: Points4, tPoint: Point): Point => {
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
// pub fn simplified_quad_roots(a: Point, b: Point, c: Point) -> [Point; 2] {
//     let d = (b * b - 4.0 * a * c).max(point!(0.0, 0.0));
//     let s = d.sqrt();
//     let q = -0.5 * (b + s.copysign(b));
//     [q / a, c / q]
// }

// export const simplifiedQuadraticRoots = (quad: ThreePoints): TwoPoints => {
//   const [ax, ay, bx, by, cx, cy] = quad;

//   const dx = Math.max(bx * bx - 4.0 * ax * cx, 0);
//   const dy = Math.max(by * by - 4.0 * ay * cy, 0);

//   const sx = Math.sqrt(dx);
//   const sy = Math.sqrt(dy);

//   const qx = -0.5 * (bx + copySign(sx, bx));
//   const qy = -0.5 * (by + copySign(sy, by));

//   return [qx / ax, cx / qx, qy / ay, cy / qy];
// };

export class CubicCurve {
  /**
   * Points
   */
  points: Float32Array;
  get p0() {
    return [this.points[0], this.points[1]];
  }
  get p1() {
    return [this.points[2], this.points[3]];
  }
  get p2() {
    return [this.points[4], this.points[5]];
  }

  get p3() {
    return [this.points[6], this.points[7]];
  }

  set p0(p0: Point) {
    this.points.set(p0, 0);
    this._dirty = true;
  }
  set p1(p1: Point) {
    this.points.set(p1, 2);
    this._dirty = true;
  }
  set p2(p2: Point) {
    this.points.set(p2, 4);
    this._dirty = true;
  }
  set p3(p3: Point) {
    this.points.set(p3, 6);
    this._dirty = true;
  }

  /**
   * Coefficients
   */
  private _coefficients = new Float32Array(6);
  private _dirty = true;

  get coefficients() {
    if (this._dirty) {
      this.calculateCoefficients();
    }
    return this._coefficients;
  }

  get a() {
    if (this._dirty) {
      this.calculateCoefficients();
    }
    return [this._coefficients[0], this._coefficients[1]];
  }
  get b() {
    if (this._dirty) {
      this.calculateCoefficients();
    }
    return [this._coefficients[2], this._coefficients[3]];
  }

  get c() {
    if (this._dirty) {
      this.calculateCoefficients();
    }
    return [this._coefficients[4], this._coefficients[5]];
  }

  get d() {
    return this.p0;
  }

  constructor(points: Float32Array) {
    this.points = points;
  }
  /**
   * Vectors
   */
  get vectors(): Points3 {
    const [p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y] = this.points;
    return [p1x - p0x, p1y - p0y, p2x - p1x, p2y - p1y, p3x - p2x, p3y - p2y];
  }
  static of(p0: Point, p1: Point, p2: Point, p3: Point) {
    return new CubicCurve(new Float32Array([...p0, ...p1, ...p2, ...p3]));
  }
  static fromBuffer(buffer: Float32Array) {
    return new CubicCurve(buffer);
  }
  calculateCoefficients() {
    const [v1x, v1y, v2x, v2y, v3x, v3y] = this.vectors;
    const ax = v3x - v2x - v2x + v1x;
    const ay = v3y - v2y - v2y + v1y;

    const bx = 3.0 * (v2x - v1x);
    const by = 3.0 * (v2y - v1y);

    const cx = 3.0 * v1x;
    const cy = 3.0 * v1y;

    this._coefficients.set([ax, ay, bx, by, cx, cy]);
    this._dirty = false;
  }

  at(t: number): Point {
    const [ax, ay, bx, by, cx, cy] = this.coefficients;
    const [dx, dy] = this.d;

    const x = ((ax * t + bx) * t + cx) * t + dx;
    const y = ((ay * t + by) * t + cy) * t + dy;

    return [x, y];
  }
}
