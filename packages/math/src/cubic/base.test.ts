import { evalT, evalIndependentT } from "./base";
import { Points4 } from "../types";

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
});
