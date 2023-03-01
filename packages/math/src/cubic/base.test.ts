import {
  evalT,
  evalIndependentT,
  solveCubic,
  solveCubic2,
  getCoefficients,
  getDerivativeCoefficients,
} from "./base";
import { Points4 } from "../types";
import { quadRoots } from "../quadratic";

describe("cubic", () => {
  /**
   *     | _
   * ____|/__\_______
   *     |    \_/
   *     |
   */
  const curve: Points4 = [
    // point0
    0, 0,

    // point1
    10, 10,

    // point2
    20, -10,

    // point3
    30, 0,
  ];
  describe("evalT", () => {
    it("should return the correct point", () => {
      const t = 0.5;
      const point = evalT(curve, t);

      expect(point).toEqual([15, 0]);
    });
  });
  describe("evalIndependentT", () => {
    it("should return the correct point", () => {
      const t = 0.5;
      const point = evalIndependentT(curve, [t, t]);
      expect(point).toEqual([15, 0]);
    });
  });

  describe("solveCubic", () => {
    it("should return the correct roots", () => {
      // Ax^3 + Bx^2 + Cx + D = 0

      // 64x^3 - 64 == 1

      const roots = solveCubic2(64, 0, 0, -64);
      console.log("roots", roots);
      // expect(roots).toEqual([1]);

      // 12x^3 + 5x^2 + 2x + -10 = 0
      // x^3 + 5/12 x^2 + 1/6 x + -10/12 = 0
      // x^3 + 5/12 x^2 + 1/6 x + -5/6 = 0
      // (x - 1/2)^3 = 0
      // x = 1/2
      const [ax, ay, bx, by, cx, cy] = getCoefficients([
        71, 78, 17, 198, 233, 167, 188, 84,
      ]);
      const roots2 = quadRoots(ax, bx, cx);

      console.log(quadRoots(ax, bx, cx), quadRoots(ay, by, cy));

      expect(roots2).toEqual([0.5]);
    });
  });
});
