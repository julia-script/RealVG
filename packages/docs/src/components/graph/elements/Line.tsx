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
  color,
  ...rest
}: LineProps) => {
  const { computeCoord } = useGraph();

  const [x1, y1] = computeCoord(start);
  const [x2, y2] = computeCoord(end);

  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const arrowSize = 3;
  return (
    <g>
      <PolyLine points={[...start, ...end]} color={color} {...rest} />

      {arrow && (
        <PolyLine
          points={[
            x2,
            y2,
            x2 - arrowSize * Math.cos(((angle - 45) * Math.PI) / 180),
            y2 - arrowSize * Math.sin(((angle - 45) * Math.PI) / 180),
            x2 - arrowSize * Math.cos(((angle + 45) * Math.PI) / 180),
            y2 - arrowSize * Math.sin(((angle + 45) * Math.PI) / 180),
          ]}
          fill={color}
        />
      )}
    </g>
  );
};
