import { Point } from "math";
import React, { useMemo } from "react";
import { PolyLine, PolyLineProps } from "../Polyline";

type ParametricProps = {
  tLimits: Point;
  xy: (t: number) => Point;
} & Omit<PolyLineProps, "points">;

const squaredDistance = (a: Point, b: Point) => {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
};

const ERROR_TOLERANCE = 0.01;
const MIN_SAMPLES = 6;
export const Parametric = ({ tLimits, xy, ...rest }: ParametricProps) => {
  const points = useMemo(() => {
    const [tMin, tMax] = tLimits;
    const toleranceSquared = ERROR_TOLERANCE * ERROR_TOLERANCE;

    const start = xy(tMin);

    const end = xy(tMax);
    const points: number[] = [...start];
    let splitCount = 0;
    const split = (left: Point, right: Point, tMin: number, tMax: number) => {
      splitCount++;
      const tMid = (tMin + tMax) / 2;
      const currMid: Point = [
        (left[0] + right[0]) / 2,
        (left[1] + right[1]) / 2,
      ];
      const realMid = xy(tMid);
      if (
        squaredDistance(realMid, currMid) <= toleranceSquared &&
        splitCount > MIN_SAMPLES
      ) {
        points.push(...realMid);
        return;
      }
      split(left, realMid, tMin, tMid);
      points.push(...realMid);
      split(realMid, right, tMid, tMax);
    };
    split(start, end, tMin, tMax);
    points.push(...end);
    return points;
  }, [...tLimits, xy]);
  return <PolyLine points={points} {...rest} />;
};
