import { Point } from "math";
import React from "react";
import { BBox } from "../utils";
import { Rect, RectProps } from "./Rect";

type BBoxRectProps = {
  bbox: BBox;
} & Omit<RectProps, "pos" | "size">;

export const BBoxRect = ({ bbox, ...rest }: BBoxRectProps) => {
  // const
  const pos: Point = [Math.min(...bbox.x), Math.min(...bbox.y)];
  return (
    <Rect
      pos={pos}
      size={[Math.max(...bbox.x) - pos[0], Math.max(...bbox.y) - pos[1]]}
      {...rest}
    />
  );
};
