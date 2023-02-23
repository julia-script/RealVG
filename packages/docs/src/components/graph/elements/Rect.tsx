import React from "react";
import { useGraph, useTheme } from "../providers";
import { GraphNodeProps, NumberUnit, NumberUnitPoint } from "../utils";

type RectProps = {
  position: NumberUnitPoint;
  size: NumberUnitPoint;
  radius?: NumberUnit;
} & GraphNodeProps;

export const Rect = ({
  position,
  size,
  radius = 0,
  weight = "regular",
  shade,
  ...rest
}: RectProps) => {
  const { computeCoord, computeSize, computeNumber } = useGraph();
  const { fillColor, strokeColor, strokeWidth, strokeDashArray, opacity } =
    useTheme(weight, rest, shade);
  const computedRadius = computeNumber(radius);
  let [x, y] = computeCoord(position);
  let [width, height] = computeSize(size);

  if (width < 0) {
    x += width;
    width = Math.abs(width);
  }

  if (height < 0) {
    y += height;
    height = Math.abs(height);
  }

  return (
    <rect
      x={x}
      y={y}
      rx={computedRadius}
      width={width}
      height={height}
      strokeWidth={strokeWidth}
      color={strokeColor}
      fill={fillColor}
      strokeDasharray={strokeDashArray.join(" ")}
      opacity={opacity}
    />
  );
};
