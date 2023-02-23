import React, { useCallback, useMemo } from "react";
import {
  axisCoordToViewSpace,
  rangesFromCoordBox,
  coordBoxFromRanges,
  NumberUnit,
  NumberUnitPoint,
  parseNumberUnit,
} from "./utils";
import { createContext } from "react";
import { isNumber } from "lodash";

type GraphContextProps = {
  width: number;
  height: number;
  // coordToViewSpace: (pos: [number, number]) => [number, number];
  // yCoordToViewSpace: (pos: number) => number;
  // xCoordToViewSpace: (pos: number) => number;
  computeNumber: (nu: NumberUnit, defaultSpace?: "vs" | "cs") => number;
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

  yRange: [number, number];
  xRange: [number, number];
  coordBox: [number, number, number, number];
};

const GraphContext = createContext<GraphContextProps>({} as GraphContextProps);

type GraphProps = {
  width: number;
  height: number;
} & React.PropsWithChildren<{}> &
  (
    | {
        xRange?: [number, number];
        yRange?: [number, number];
        coordBox: [number, number, number, number];
      }
    | {
        xRange: [number, number];
        yRange: [number, number];
        coordBox?: [number, number, number, number];
      }
  );

export const GraphProvider = ({
  width,
  height,
  xRange,
  yRange,
  coordBox,
  children,
}: GraphProps) => {
  const ranges = useMemo(() => {
    if (xRange && yRange) {
      return { xRange, yRange, coordBox: coordBoxFromRanges(xRange, yRange) };
    }
    if (!coordBox) {
      throw new Error("Either xRange and yRange or coordBox must be provided");
    }
    const ranges = rangesFromCoordBox(coordBox, [width, height]);
    return { xRange: ranges[0], yRange: ranges[1], coordBox };
  }, [coordBox, yRange, xRange, width, height]);

  const unitCoordSize = useMemo<[number, number]>(() => {
    const { xRange, yRange } = ranges;
    return [
      width / Math.abs(xRange[1] - xRange[0]),
      height / Math.abs(yRange[1] - yRange[0]),
    ];
  }, [ranges, width, height]);

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
  const computeSize = useCallback(
    (value: NumberUnitPoint, defaultSpace: "vs" | "cs" = "cs") => {
      return [
        computeNumber(value[0], defaultSpace),
        computeNumber(value[1], defaultSpace),
      ] as [number, number];
    },
    [computeNumber]
  );

  const computeYCoord = useCallback(
    (coord: NumberUnit, defaultSpace: "vs" | "cs" = "cs") => {
      const [value, unit] = parseNumberUnit(coord, defaultSpace);
      if (unit === "vs") {
        return value;
      }
      return axisCoordToViewSpace(value, ranges.yRange, height);
    },
    [ranges, height]
  );

  const computeXCoord = useCallback(
    (coord: NumberUnit, defaultSpace: "vs" | "cs" = "cs") => {
      const [value, unit] = parseNumberUnit(coord, defaultSpace);
      if (unit === "vs") {
        return value;
      }

      return axisCoordToViewSpace(value, ranges.xRange, width);
    },
    [ranges, width]
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
        width,
        height,

        computeNumber,
        computeSize,

        computeCoord,
        computeYCoord,
        computeXCoord,
        ...ranges,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => React.useContext(GraphContext);
