import React from "react";
import { useMemo } from "react";
import { useGraph } from "./graph-provider";
import { useTheme } from "./theme-provider";

type BBoxProps = {
  bbox: [number, number, number, number];
} & Omit<
  React.SVGProps<SVGRectElement>,
  "x" | "y" | "width" | "height" | "bbox"
>;

export const BBox = ({ bbox, ...props }: BBoxProps) => {
  const { computeCoord } = useGraph();
  const {} = useTheme();
  let [left, top] = computeCoord([bbox[0], bbox[1]]);
  let [right, bottom] = computeCoord([bbox[2], bbox[3]]);
  const x = Math.min(left, right);
  const y = Math.min(top, bottom);
  const width = Math.max(left, right);
  const height = Math.max(top, bottom);

  return (
    <rect
      fill="none"
      x={x}
      y={y}
      width={width - x}
      height={height - y}
      strokeWidth={1}
      stroke="black"
      {...props}
    />
  );
};
