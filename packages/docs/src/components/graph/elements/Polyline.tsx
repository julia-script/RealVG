import React from "react";
import { useMemo } from "react";
import { GraphNodeProps, NumberUnit } from "../utils";
import { useGraph, useTheme } from "../providers";

type PolyLineProps = {
  points: NumberUnit[];
} & GraphNodeProps;

export const PolyLine = ({
  points,
  weight = "regular",
  shade,
  ...props
}: PolyLineProps) => {
  const { computeCoord, width, height } = useGraph();
  const { strokeColor, strokeWidth, strokeDashArray } = useTheme(
    weight,
    props,
    shade
  );

  const pointsString = useMemo(() => {
    let path = "";
    for (let i = 0; i < points.length; i += 2) {
      const [x, y] = computeCoord([points[i], points[i + 1]]);
      path += `${x} ${y} `;
    }
    return path.trim();
  }, [points, width, height]);
  return (
    <polyline
      points={pointsString}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDashArray.join(" ")}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};
