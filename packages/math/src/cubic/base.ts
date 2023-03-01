import { lerp } from "../utils";
import { fill, max } from "lodash";
import { Points4, Points2, Point, Points3 } from "../types";
import { quadRoots } from "../quadratic";

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

  velocityAt(t: number): Point {
    const [ax, ay, bx, by, cx, cy] = this.coefficients;

    const vx = (3.0 * ax * t + 2.0 * bx) * t + cx;
    const vy = (3.0 * ay * t + 2.0 * by) * t + cy;

    return [vx, vy];
  }

  normalAt(t: number): Point {
    const [vx, vy] = this.velocityAt(t);
    const mag = Math.sqrt(vx * vx + vy * vy);
    return [vy / mag, -vx / mag];
  }

  roots(): [number[], number[]] {
    const [ax, ay, bx, by, cx, cy] = this.coefficients;
    const [dx, dy] = this.d;

    const xRoots = solveCubic(ax, bx, cx, dx);
    const yRoots = solveCubic(ay, by, cy, dy);

    return [xRoots, yRoots];
  }
  extremas(): number[] {
    const [ax, ay, bx, by, cx, cy] = this.coefficients;
    // derivative coefficients

    const dax = 3 * ax;
    const day = 3 * ay;
    const dbx = 2 * bx;
    const dby = 2 * by;

    const xRoots = quadRoots(dax, dbx, cx);
    const yRoots = quadRoots(day, dby, cy);

    return [...xRoots, ...yRoots].filter((t) => t >= 0 && t <= 1);
  }
  extremaPoints() {
    return this.extremas().map((t) => this.at(t));
  }

  bbox(): Points2 {
    const extremas = this.extremaPoints();
    const [x0, y0, _, __, ___, ____, x1, y1] = this.points;

    const [dx, dy] = this.d;

    const xMin = Math.min(x0, x1);
    const xMax = Math.max(x0, x1);
    const yMin = Math.min(y0, y1);
    const yMax = Math.max(y0, y1);

    return [
      Math.min(xMin, ...extremas.map(([x]) => x)),
      Math.min(yMin, ...extremas.map(([, y]) => y)),
      Math.max(xMax, ...extremas.map(([x]) => x)),
      Math.max(yMax, ...extremas.map(([, y]) => y)),
    ];
  }
}

//  IsZero(x)	((x) > -EQN_EPS && (x) < EQN_EPS)
const EQN_EPS = 1e-9;
const isZero = (x: number) => x > -EQN_EPS && x < EQN_EPS;
const nearZero = (n: number, epsilon = 0.00001) => {
  return Math.abs(n) < epsilon;
};
const pushIfInRange = (roots: number[], t: number, tMin = 0, tMax = 1) => {
  if (t >= tMin && t <= tMax) {
    roots.push(t);
  }
  return roots;
};

// A real-cuberoots-only function:
const cuberoot = (v: number) => {
  if (v < 0) return -Math.pow(-v, 1 / 3);
  return Math.pow(v, 1 / 3);
};

export const solveCubic = (a: number, b: number, c: number, d: number) => {
  // do a check to see whether we even need cubic solving:

  if (nearZero(d)) {
    // if d is zero, then the cubic equation reduces to a quadratic equation
    // and we can use quadratic solving.
    if (nearZero(a)) {
      // if a is zero, then the quadratic equation reduces to a linear equation
      if (nearZero(b)) {
        return [];
      }
      // if b is not zero, then the linear equation has a single solution
      return pushIfInRange([], -c / b);
    }
    // if a is not zero, then the quadratic equation has two solutions
    return quadRoots(a, b, c).filter((t) => t >= 0 && t <= 1);
  }

  // if d is not zero, then we need to solve the cubic equation

  a /= d;
  b /= d;
  c /= d;

  const p = (3 * b - a * a) / 3,
    p3 = p / 3,
    q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
    q2 = q / 2,
    discriminant = q2 * q2 + p3 * p3 * p3;

  let u1, v1, root1, root2, root3;

  // three possible real roots:
  if (discriminant < 0) {
    const { sqrt, cos, acos, PI } = Math;
    var mp3 = -p / 3,
      mp33 = mp3 * mp3 * mp3,
      r = sqrt(mp33),
      t = -q / (2 * r),
      cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
      phi = acos(cosphi),
      crtr = cuberoot(r),
      t1 = 2 * crtr;
    root1 = t1 * cos(phi / 3) - a / 3;
    root2 = t1 * cos((phi + 2 * PI) / 3) - a / 3;
    root3 = t1 * cos((phi + 4 * PI) / 3) - a / 3;

    return [root1, root2, root3]; //.filter((t) => t >= 0 && t <= 1);
  }

  // three real roots, but two of them are equal:
  if (discriminant === 0) {
    u1 = q2 < 0 ? cuberoot(-q2) : -cuberoot(q2);
    root1 = 2 * u1 - a / 3;
    root2 = -u1 - a / 3;
    return [root1, root2].filter((t) => t >= 0 && t <= 1);
  }

  // one real root, two complex roots
  var sd = Math.sqrt(discriminant);
  u1 = cuberoot(sd - q2);
  v1 = cuberoot(sd + q2);
  root1 = u1 - v1 - a / 3;
  if (root1 >= 0 && root1 <= 1) return [root1];
  return [];
};

export const solveCubic2 = (a: number, b: number, c: number, d: number) => {
  /* normal form: x^3 + Ax^2 + Bx + C = 0 */

  a = a / d;
  b = b / d;
  c = c / d;

  /*  substitute x = y - A/3 to eliminate quadric term:
	x^3 +px + q = 0 */

  // sq_A = A * A;
  // p = 1.0/3 * (- 1.0/3 * sq_A + B);
  // q = 1.0/2 * (2.0/27 * A * sq_A - 1.0/3 * A * B + C);

  const sq_A = a * a;
  const p = (1.0 / 3) * ((-1.0 / 3) * sq_A + b);
  const q = (1.0 / 2) * ((2.0 / 27) * a * sq_A - (1.0 / 3) * a * b + c);

  /* use Cardano's formula */

  let cb_p = p * p * p;
  const discriminant = q * q + cb_p;
  const roots = [];
  if (isZero(discriminant)) {
    if (isZero(q)) {
      /* one triple solution */
      // u = 0;
      roots.push(0);
    } else {
      /* one single and one double solution */
      const u = cuberoot(-q);

      // return [2 * u, -u];
      roots.push(2 * u, -u);
    }
  } else if (discriminant < 0) {
    /* Casus irreducibilis: three real solutions */

    const phi = (1.0 / 3) * Math.acos(-q / Math.sqrt(-cb_p));
    const t = 2 * Math.sqrt(-p);

    roots.push(
      t * Math.cos(phi),
      -t * Math.cos(phi + Math.PI / 3),
      -t * Math.cos(phi - Math.PI / 3)
    );
  } else {
    /* one real solution */
    const sqrt_disc = Math.sqrt(discriminant);
    const u = cuberoot(sqrt_disc - q);
    const v = -cuberoot(sqrt_disc + q);

    roots.push(u + v);
  }

  /* resubstitute */
  const sub = (1.0 / 3) * a;

  for (let i = 0; i < roots.length; ++i) {
    roots[i] -= sub;
  }

  return roots.filter((t) => t >= 0 && t <= 1);
};
