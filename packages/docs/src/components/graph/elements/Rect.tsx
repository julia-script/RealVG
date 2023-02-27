import React from "react";
import { useGraph, useTheme } from "../providers";
import {
  GraphNodeProps,
  NumberUnit,
  NumberUnitPoint,
  parseNumberUnit,
} from "../utils";
import { Line } from "./Line";
import { Mark } from "./Mark";
import { PolyLine } from "./Polyline";

export type RectProps = {
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
  const { computeCoord, computeSize, computeNumber, coordBox } = useGraph();
  const { fillColor, strokeColor, strokeWidth, strokeDashArray, opacity } =
    useTheme(weight, rest, shade);
  const computedRadius = computeNumber(radius);
  const [_, xUnit] = parseNumberUnit(position[0]);
  const [__, yUnit] = parseNumberUnit(position[1]);
  const [___, widthUnit] = parseNumberUnit(size[0]);
  const [____, heightUnit] = parseNumberUnit(size[1]);

  let topLeft = computeCoord(position);
  let [width, height] = computeSize(size);

  if (widthUnit === "cs") {
    width = -width;
  }

  if (heightUnit === "cs") {
    height = -height;
  }

  let bottomRight: [number, number] = [topLeft[0] + width, topLeft[1] + height];

  return (
    <g className="rect">
      <rect
        x={Math.min(topLeft[0], bottomRight[0])}
        y={Math.min(topLeft[1], bottomRight[1])}
        rx={computedRadius}
        width={Math.abs(width)}
        height={Math.abs(height)}
        strokeWidth={strokeWidth}
        stroke={strokeColor}
        fill={fillColor}
        strokeDasharray={strokeDashArray.join(" ")}
        opacity={opacity}
      />
    </g>
  );
};
