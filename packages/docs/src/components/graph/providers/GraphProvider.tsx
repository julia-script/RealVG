import React, { useCallback, useMemo } from "react";
import {
  NumberUnit,
  NumberUnitPoint,
  parseNumberUnit,
  calculateVisibleCoordBox,
  BBox,
} from "../utils";
import { createContext } from "react";
import { Point, remap } from "math";
import { isArray, isString } from "lodash";
import { Color, StrokeStyle, Theme } from "../utils/styles";

export type GraphContextProps = {
  width: number;
  height: number;
  graphRef: React.RefObject<SVGSVGElement>;

  computeNumber: (nu: NumberUnit, defaultSpace?: "vs" | "cs") => number;

  computeSizeToCoordSpace: (nu: Point) => Point;

  computeSize: (
    nu: [NumberUnit, NumberUnit],
    defaultSpace?: "vs" | "cs"
  ) => Point;
  computeCoord: (
    nu: [NumberUnit, NumberUnit],
    defaultSpace?: "vs" | "cs"
  ) => Point;
  computeYCoord: (nu: NumberUnit, defaultSpace?: "vs" | "cs") => number;
  computeXCoord: (nu: NumberUnit, defaultSpace?: "vs" | "cs") => number;

  computeColor: (index: Color) => string;
  computeDashArray: (strokeStyle: StrokeStyle, strokeWidth: number) => string;

  coordBox: BBox;
  visibleCoordBox: BBox;
  coordStep: Point;
  theme: Theme;
};

const GraphContext = createContext<GraphContextProps>({} as GraphContextProps);

type GraphProps = {
  graphRef: React.RefObject<SVGSVGElement>;
  width: number;
  height: number;
  coordStep: Point;
  coordBox: {
    y: Point;
    x: Point;
  };
  padding: Point;
  theme: Theme;
} & React.PropsWithChildren<{}>;

export const GraphProvider = ({
  graphRef,
  width,
  height,
  coordBox,
  children,
  coordStep,
  padding,
  theme,
}: GraphProps) => {
  const visibleCoordBox = useMemo(() => {
    return calculateVisibleCoordBox(
      [width, height],
      coordBox,
      coordStep,
      padding
    );
  }, [coordBox, coordStep, width, height, ...padding]);

  const coordSize = useMemo<Point>(() => {
    const [xStart, xEnd] = visibleCoordBox.x;
    const [yStart, yEnd] = visibleCoordBox.y;

    const coordWidth = Math.max(xStart, xEnd) - Math.min(xStart, xEnd);
    const coordHeight = Math.max(yStart, yEnd) - Math.min(yStart, yEnd);
    return [coordWidth, coordHeight];
  }, [...visibleCoordBox.x, ...visibleCoordBox.y]);

  const unitCoordSize = useMemo<Point>(() => {
    const [xStart, xEnd] = visibleCoordBox.x;
    const [yStart, yEnd] = visibleCoordBox.y;

    const [coordWidth, coordHeight] = coordSize;
    return [
      (width / coordWidth) * Math.sign(xStart - xEnd),
      (height / coordHeight) * Math.sign(yStart - yEnd),
    ];
  }, coordSize);

  const computeNumber = useCallback(
    (unitValue: NumberUnit, defaultSpace: "vs" | "cs" = "cs") => {
      const [value, unit] = parseNumberUnit(unitValue, defaultSpace);
      if (unit === "vs") {
        return value;
      }
      return value * unitCoordSize[1];
    },
    unitCoordSize
  );

  const computeSizeToCoordSpace = useCallback((coord: Point) => {
    const [x, y] = coord;
    return [-x / unitCoordSize[0], -y / unitCoordSize[1]] as Point;
  }, unitCoordSize);

  const computeSize = useCallback(
    (unitValue: NumberUnitPoint, defaultSpace: "vs" | "cs" = "cs") => {
      const [x, xUnit] = parseNumberUnit(unitValue[0], defaultSpace);
      const [y, yUnit] = parseNumberUnit(unitValue[1], defaultSpace);
      return [
        xUnit === "vs" ? x : x * unitCoordSize[0],
        yUnit === "vs" ? y : y * unitCoordSize[1],
      ] as Point;
    },
    unitCoordSize
  );

  const computeYCoord = useCallback(
    (coord: NumberUnit, defaultSpace: "vs" | "cs" = "cs") => {
      const [value, unit] = parseNumberUnit(coord, defaultSpace);
      if (unit === "vs") {
        return value;
      }
      return remap(value, ...visibleCoordBox.y, 0, height);
    },
    [...visibleCoordBox.y, height]
  );

  const computeXCoord = useCallback(
    (coord: NumberUnit, defaultSpace: "vs" | "cs" = "cs") => {
      const [value, unit] = parseNumberUnit(coord, defaultSpace);
      if (unit === "vs") {
        return value;
      }

      return remap(value, ...visibleCoordBox.x, 0, width);
    },
    [...visibleCoordBox.x, width]
  );

  const computeCoord = useCallback(
    (coord: NumberUnitPoint, defaultSpace: "vs" | "cs" = "cs") => {
      return [
        computeXCoord(coord[0], defaultSpace),
        computeYCoord(coord[1], defaultSpace),
      ] as Point;
    },
    [computeXCoord, computeYCoord]
  );

  const computeColor = useCallback(
    (color: number | string) => {
      if (isString(color)) {
        return color;
      }
      return theme.palette[color % theme.palette.length];
    },
    [theme]
  );

  const computeDashArray = useCallback(
    (strokeStyle: StrokeStyle, strokeWidth: number) => {
      if (isArray(strokeStyle)) {
        return strokeStyle.map((s) => computeNumber(s)).join(" ");
      }
      if (strokeStyle === "dashed") {
        return `${strokeWidth * 2} ${strokeWidth * 4}`;
      }

      if (strokeStyle === "dotted") {
        return `0 ${strokeWidth * 2}`;
      }

      return "none";
    },
    [computeNumber]
  );

  return (
    <GraphContext.Provider
      value={{
        graphRef,
        width,
        height,
        coordStep,

        computeNumber,
        computeSize,

        computeCoord,
        computeYCoord,
        computeXCoord,

        computeSizeToCoordSpace,
        computeColor,
        computeDashArray,

        coordBox,
        visibleCoordBox,
        theme,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => React.useContext(GraphContext);
