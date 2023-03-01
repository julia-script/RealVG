import React from "react";
import { useGraph } from "../providers";
import { Color, getStrokeDashArray, StrokeStyle } from "../utils/styles";
import { NumberUnit, NumberUnitPoint, parseNumberUnit } from "../utils";
import { Point } from "math";

export type RectProps = {
  pos: NumberUnitPoint;
  size: NumberUnitPoint;
  radius?: NumberUnit;
  color?: Color;
  fill?: Color;
  strokeWidth?: NumberUnit;
  strokeStyle?: StrokeStyle;
};

export const Rect = ({
  pos,
  size,
  radius = 0,
  color = 0,
  strokeStyle = "solid",
  strokeWidth = 2,
  fill = "none",
}: RectProps) => {
  const {
    computeCoord,
    computeSize,
    computeNumber,
    computeColor,
    computeDashArray,
  } = useGraph();

  const computedRadius = computeNumber(radius, "vs");

  const widthUnit = parseNumberUnit(size[0])[1];
  const heightUnit = parseNumberUnit(size[1])[1];

  let topLeft = computeCoord(pos);
  let [width, height] = computeSize(size);

  if (widthUnit === "cs") {
    width = -width;
  }

  if (heightUnit === "cs") {
    height = -height;
  }

  let bottomRight: Point = [topLeft[0] + width, topLeft[1] + height];

  strokeWidth = computeNumber(strokeWidth, "vs");

  return (
    <rect
      x={Math.min(topLeft[0], bottomRight[0])}
      y={Math.min(topLeft[1], bottomRight[1])}
      rx={computedRadius}
      width={Math.abs(width)}
      height={Math.abs(height)}
      strokeWidth={strokeWidth}
      fill={computeColor(fill)}
      stroke={computeColor(color)}
      strokeDasharray={computeDashArray(strokeStyle, strokeWidth)}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};
