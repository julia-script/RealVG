import React from "react";
import { NumberUnitPoint } from "../utils";
import { useGraph } from "../providers";
import { PolyLine, PolyLineProps } from "./Polyline";

type LineProps = {
  start: NumberUnitPoint;
  end: NumberUnitPoint;
  arrow?: boolean;
} & Omit<PolyLineProps, "points">;

export const Line = ({
  start,
  end,
  arrow = false,
  color = 0,
  width = 2,
  ...rest
}: LineProps) => {
  const { computeCoord, computeColor, computeNumber } = useGraph();

  const [x1, y1] = computeCoord(start);
  const [x2, y2] = computeCoord(end);
  const widthVs = computeNumber(width, "vs");
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowSize = widthVs * 2.5;

  return (
    <g>
      <PolyLine
        width={width}
        points={[...start, ...end]}
        color={color}
        {...rest}
      />

      {arrow && (
        <PolyLine
          width={width}
          color={computeColor(color)}
          points={[
            `${x2 + arrowSize * Math.cos(angle - Math.PI * 0.75)}vs`,
            `${y2 + arrowSize * Math.sin(angle - Math.PI * 0.75)}vs`,
            `${x2}vs`,
            `${y2}vs`,
            `${x2 + arrowSize * Math.cos(angle + Math.PI * 0.75)}vs`,
            `${y2 + arrowSize * Math.sin(angle + Math.PI * 0.75)}vs`,
          ]}
        />
      )}
    </g>
  );
};
