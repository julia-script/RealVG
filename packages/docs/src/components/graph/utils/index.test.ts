import { calculateVisibleCoordBox } from "./";
describe("utils", () => {
  describe("centerCoordBoxInViewSpace", () => {
    it("does nothing if the view and coord box have the same ratio", () => {
      expect(
        calculateVisibleCoordBox(
          [100, 100],
          { x: [0, 10], y: [0, 10] },
          [1, 1],
          [0, 0]
        )
      ).toEqual({ x: [0, 10], y: [0, 10] });
    });

    it("scales coord width to match view ratio", () => {
      expect(
        calculateVisibleCoordBox(
          [200, 100],
          { x: [0, 10], y: [0, 10] },
          [1, 1],
          [0, 0]
        )
      ).toEqual({ x: [-5, 15], y: [0, 10] });
    });
    it("scales coord width to match view ratio with left to right range", () => {
      expect(
        calculateVisibleCoordBox(
          [200, 100],
          { x: [10, 0], y: [0, 10] },
          [1, 1],
          [0, 0]
        )
      ).toEqual({ x: [15, -5], y: [0, 10] });
    });

    it("scales coord height to match view ratio", () => {
      expect(
        calculateVisibleCoordBox(
          [100, 200],
          { x: [0, 10], y: [0, 10] },
          [1, 1],
          [0, 0]
        )
      ).toEqual({ x: [0, 10], y: [-5, 15] });
    });
    it("scales coord height to match view ratio with top to bottom range", () => {
      expect(
        calculateVisibleCoordBox(
          [100, 200],
          { x: [0, 10], y: [10, 0] },
          [1, 1],
          [0, 0]
        )
      ).toEqual({ x: [0, 10], y: [15, -5] });
    });

    it("account for padding", () => {
      console.log(
        calculateVisibleCoordBox(
          [100, 100],
          { x: [0, 10], y: [0, 10] },
          [1, 1],
          [10, 10]
        )
      );
    });
  });
});
