import React from "react";
import { Mark, MarkProps } from "./Mark";
import { useGraph } from "./graph-provider";

const mapPoints = <T,>(
  points: number[],
  fn: (point: [number, number], i: number) => T
): T[] => {
  const newPoints: T[] = [];
  for (let i = 0; i < points.length; i += 2) {
    newPoints.push(fn([points[i], points[i + 1]], i / 2));
  }
  return newPoints;
};

export type PointTrailProps = {
  points: number[];
} & Omit<MarkProps, "pos">;

export const PointTrail = ({ points = [], ...rest }: PointTrailProps) => {
  return (
    <g>
      {mapPoints(points, (point, i) => {
        return <Mark key={i} pos={point} {...rest} />;
      })}
    </g>
  );
};
