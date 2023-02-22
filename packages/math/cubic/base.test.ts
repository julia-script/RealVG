import { evalT, evalIndependentT } from "./base";

describe("cubic", () => {
  /**
   *     | _
   * ____|/__\_______
   *     |    \_/
   *     |
   */
  const curve: CubicSequence = [
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
