import { CubicSequence } from "math";
import React from "react";
import { useMemo } from "react";
import { useGraph, useTheme } from "../providers";
import { GraphNodeProps } from "../utils";

type BezierCurveProps = {
  points: number[];
  order?: 2 | 3;
} & GraphNodeProps;

export const BezierCurve = ({
  points,
  order = 3,
  weight = "secondary",
  shade,
  ...rest
}: BezierCurveProps) => {
  const { computeCoord } = useGraph();
  const { strokeColor, strokeWidth } = useTheme(weight, rest, shade);
  const curveDataString = useMemo(() => {
    let path = "";
    const pushCubic = (curve: CubicSequence) => {
      if (path.length === 0) {
        path += `M ${curve[0]} ${curve[1]}`;
      }
      path += ` C ${curve[2]} ${curve[3]} ${curve[4]} ${curve[5]} ${curve[6]} ${curve[7]}`;
    };
    for (let i = 0; i < points.length - 6; i += order * 2) {
      if (order === 3) {
        pushCubic([
          ...computeCoord([points[i], points[i + 1]]),
          ...computeCoord([points[i + 2], points[i + 3]]),
          ...computeCoord([points[i + 4], points[i + 5]]),
          ...computeCoord([points[i + 6], points[i + 7]]),
        ]);
      }
    }
    return path;
  }, [points]);
  return (
    <path
      d={curveDataString}
      fill="none"
      strokeWidth={strokeWidth}
      stroke={strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};
