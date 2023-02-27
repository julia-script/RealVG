import React from "react";
import { useMemo } from "react";
import { NumberUnit } from "../utils";
import { useGraph } from "../providers";
import { Color, getStrokeDashArray, StrokeStyle } from "../utils/styles";

export type PolyLineProps = {
  points: NumberUnit[];
  width?: NumberUnit;
  color?: Color;
  fill?: Color;
  strokeStyle?: StrokeStyle;
};

export const PolyLine = ({
  points,
  width = 4,
  color = 0,
  strokeStyle = "solid",
  fill,
}: PolyLineProps) => {
  const { computeCoord, computeColor, computeNumber } = useGraph();

  const pointsString = useMemo(() => {
    let path = "";
    for (let i = 0; i < points.length; i += 2) {
      const [x, y] = computeCoord([points[i], points[i + 1]]);
      path += `${x} ${y} `;
    }
    return path.trim();
  }, [points, computeCoord]);
  const strokeWidth = computeNumber(width, "vs");
  const strokeDashArray = useMemo(() => {
    return getStrokeDashArray(strokeStyle, strokeWidth)
      .map((x) => computeNumber(x, "vs"))
      .join(" ");
  }, [strokeStyle, computeNumber]);
  return (
    <polyline
      points={pointsString}
      fill={fill ? computeColor(fill) : "none"}
      stroke={computeColor(color)}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDashArray}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};
