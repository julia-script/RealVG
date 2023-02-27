import { Point, Points3, Points2 } from "../types";
import { lerp } from "../utils";

export const getVectors = (
  p0: number,
  p1: number,
  p2: number
): [number, number] => {
  const v1 = p1 - p0;
  const v2 = p2 - p1;
  return [v1, v2];
};

export const getCurveVectors = (curve: Points3): Points2 => {
  const [p0x, p0y, p1x, p1y, p2x, p2y] = curve;
  return [...getVectors(p0x, p1x, p2x), ...getVectors(p0y, p1y, p2y)];
};

export const getCoefficients = (
  p0: number,
  p1: number,
  p2: number
): [number, number, number] => {
  const [v1, v2] = getVectors(p0, p1, p2);
  const a = v2 - v1;
  const b = 2 * v1;
  const c = p0;
  return [a, b, c];
};

export const getDerivativeCoefficients = (
  p0: number,
  p1: number,
  p2: number
): [number, number] => {
  const [v1, v2] = getVectors(p0, p1, p2);

  const a = 2.0 * v2 - 2.0 * v1;
  const b = 2.0 * v1;
  return [a, b];
};

export const quadRoots = (a: number, b: number, c: number): number[] => {
  const roots: number[] = [];
  const delta = b * b - 4.0 * a * c;
  if (delta < 0) {
    return roots;
  }
  const squaredDelta = Math.sqrt(delta);
  const q = -0.5 * (b + squaredDelta * Math.sign(b));

  return [q / a, c / q];
};

export class QuadCurve {
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

  /**
   * Coefficients
   */

  private _coefficients = new Float32Array(4);
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
    return this.p0;
  }

  /**
   * Vectors
   */
  get vectors(): Points2 {
    const [p0x, p0y, p1x, p1y, p2x, p2y] = this.points;
    return [p1x - p0x, p1y - p0y, p2x - p1x, p2y - p1y];
  }

  constructor(points: Float32Array) {
    this.points = points;
  }
  static of(p0: Point, p1: Point, p2: Point) {
    return new QuadCurve(new Float32Array([...p0, ...p1, ...p2]));
  }
  static fromBuffer(buffer: Float32Array) {
    return new QuadCurve(buffer);
  }

  calculateCoefficients() {
    const [v0x, v0y, v1x, v1y] = this.vectors;
    const ax = v1x - v0x;
    const ay = v1y - v0y;

    const bx = 2 * v0x;
    const by = 2 * v0y;

    this._coefficients.set([ax, ay], 0);
    this._coefficients.set([bx, by], 2);

    this._dirty = false;
  }

  at(t: number): Point {
    const [ax, ay, bx, by] = this.coefficients;
    const [cx, cy] = this.c;
    const x = (ax * t + bx) * t + cx;
    const y = (ay * t + by) * t + cy;
    return [x, y];
  }

  roots(): [number[], number[]] {
    const [ax, ay] = this.a;
    const [bx, by] = this.b;
    const [cx, cy] = this.c;

    const xRoots = quadRoots(ax, bx, cx);
    const yRoots = quadRoots(ay, by, cy);

    return [xRoots, yRoots];
  }
  extremas(): Point {
    const [ax, ay, bx, by] = this._coefficients;
    const xExtrema = -bx / (2 * ax);
    const yExtrema = -by / (2 * ay);

    return [xExtrema, yExtrema];
  }
  split() {
    return this.splitAt(0.5);
  }
  splitAt(t: number): [QuadCurve, QuadCurve] {
    const p01x = lerp(this.p0[0], this.p1[0], t);
    const p01y = lerp(this.p0[1], this.p1[1], t);

    const p12x = lerp(this.p1[0], this.p2[0], t);
    const p12y = lerp(this.p1[1], this.p2[1], t);

    const left = QuadCurve.of(
      this.p0,
      [p01x, p01y],
      [lerp(p01x, p12x, t), lerp(p01y, p12y, t)]
    );
    const right = QuadCurve.of(left.p2, [p12x, p12y], this.p2);

    return [left, right];
  }
}
