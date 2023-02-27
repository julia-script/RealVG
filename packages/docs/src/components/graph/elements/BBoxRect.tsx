import React from "react";
import { useGraph, useTheme } from "../providers";
import { GraphNodeProps, NumberUnit, NumberUnitPoint, BBox } from "../utils";
import { Rect, RectProps } from "./Rect";

type BBoxRectProps = {
  bbox: BBox;
} & Omit<RectProps, "position" | "size">;

export const BBoxRect = ({
  weight = "regular",
  bbox,
  shade,
  ...rest
}: BBoxRectProps) => {
  const { computeCoord, computeSize, computeNumber } = useGraph();
  const { fillColor, strokeColor, strokeWidth, strokeDashArray, opacity } =
    useTheme(weight, rest, shade);

  // const
  const position: [number, number] = [Math.min(...bbox.x), Math.min(...bbox.y)];
  return (
    <Rect
      position={position}
      size={[
        Math.max(...bbox.x) - position[0],
        Math.max(...bbox.y) - position[1],
      ]}
      fillColor="none"
      strokeColor="white"
      strokeWidth={2}
      {...rest}
    />
  );
};
