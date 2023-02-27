import React, { useCallback, useEffect, useMemo } from "react";
import {
  axisCoordToViewSpace,
  rangesFromCoordBox,
  coordBoxFromRanges,
  NumberUnit,
  NumberUnitPoint,
  parseNumberUnit,
  calculateVisibleCoordBox,
  BBox,
} from "../utils";
import { createContext } from "react";
import { Rect } from "../elements";
import { remap } from "math";

export type GraphContextProps = {
  width: number;
  height: number;
  graphRef: React.RefObject<SVGSVGElement>;

  computeNumber: (nu: NumberUnit, defaultSpace?: "vs" | "cs") => number;

  computeSizeToCoordSpace: (nu: [number, number]) => [number, number];

  computeSize: (
    nu: [NumberUnit, NumberUnit],
    defaultSpace?: "vs" | "cs"
  ) => [number, number];
  computeCoord: (
    nu: [NumberUnit, NumberUnit],
    defaultSpace?: "vs" | "cs"
  ) => [number, number];
  computeYCoord: (nu: NumberUnit, defaultSpace?: "vs" | "cs") => number;
  computeXCoord: (nu: NumberUnit, defaultSpace?: "vs" | "cs") => number;

  coordBox: BBox;
  visibleCoordBox: BBox;
  coordStep: [number, number];
};

const GraphContext = createContext<GraphContextProps>({} as GraphContextProps);

type GraphProps = {
  graphRef: React.RefObject<SVGSVGElement>;
  width: number;
  height: number;
  coordStep: [number, number];
  coordBox: {
    y: [number, number];
    x: [number, number];
  };
  padding: [number, number];
} & React.PropsWithChildren<{}>;

export const GraphProvider = ({
  graphRef,
  width,
  height,
  coordBox,
  children,
  coordStep,
  padding,
}: GraphProps) => {
  const visibleCoordBox = useMemo(() => {
    return calculateVisibleCoordBox(
      [width, height],
      coordBox,
      coordStep,
      padding
    );
  }, [coordBox, coordStep, width, height, ...padding]);

  const unitCoordSize = useMemo<[number, number]>(() => {
    const [xStart, xEnd] = visibleCoordBox.x;
    const [yStart, yEnd] = visibleCoordBox.y;

    const coordWidth = Math.max(xStart, xEnd) - Math.min(xStart, xEnd);
    const coordHeight = Math.max(yStart, yEnd) - Math.min(yStart, yEnd);
    return [
      (width / coordWidth) * Math.sign(xStart - xEnd),
      (height / coordHeight) * Math.sign(yStart - yEnd),
    ];
  }, [visibleCoordBox]);

  const computeNumber = useCallback(
    (unitValue: NumberUnit, defaultSpace: "vs" | "cs" = "cs") => {
      const [value, unit] = parseNumberUnit(unitValue, defaultSpace);
      if (unit === "vs") {
        return value;
      }
      return value * unitCoordSize[1];
    },
    [unitCoordSize]
  );

  const computeSizeToCoordSpace = useCallback(
    (coord: [number, number]) => {
      const [x, y] = coord;
      return [-x / unitCoordSize[0], -y / unitCoordSize[1]] as [number, number];
    },
    [unitCoordSize]
  );

  const computeSize = useCallback(
    (unitValue: NumberUnitPoint, defaultSpace: "vs" | "cs" = "cs") => {
      const [x, xUnit] = parseNumberUnit(unitValue[0], defaultSpace);
      const [y, yUnit] = parseNumberUnit(unitValue[1], defaultSpace);
      return [
        xUnit === "vs" ? x : x * unitCoordSize[0],
        yUnit === "vs" ? y : y * unitCoordSize[1],
      ] as [number, number];
    },
    [unitCoordSize]
  );

  const computeYCoord = useCallback(
    (coord: NumberUnit, defaultSpace: "vs" | "cs" = "cs") => {
      const [value, unit] = parseNumberUnit(coord, defaultSpace);
      if (unit === "vs") {
        return value;
      }
      return remap(value, ...visibleCoordBox.y, 0, height);
    },
    [visibleCoordBox, height]
  );

  const computeXCoord = useCallback(
    (coord: NumberUnit, defaultSpace: "vs" | "cs" = "cs") => {
      const [value, unit] = parseNumberUnit(coord, defaultSpace);
      if (unit === "vs") {
        return value;
      }

      return remap(value, ...visibleCoordBox.x, 0, width);
    },
    [visibleCoordBox, width]
  );

  const computeCoord = useCallback(
    (coord: NumberUnitPoint, defaultSpace: "vs" | "cs" = "cs") => {
      return [
        computeXCoord(coord[0], defaultSpace),
        computeYCoord(coord[1], defaultSpace),
      ] as [number, number];
    },
    [computeXCoord, computeYCoord]
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

        coordBox,
        visibleCoordBox,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => React.useContext(GraphContext);
