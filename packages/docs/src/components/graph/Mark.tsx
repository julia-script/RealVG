import { round } from "lodash";
import React from "react";
import { useGraph } from "./graph-provider";
import { useTheme } from "./theme-provider";
import { GraphNodeProps, NumberUnit, NumberUnitPoint } from "./utils";

export type MarkProps = {
  pos: NumberUnitPoint;
  size?: NumberUnit;
  displayLabel?: boolean;
  displayPoint?: boolean;
  labelDirection?: number;
  label?: (pos: [number, number]) => string;
} & GraphNodeProps;

export const Mark = ({
  pos,
  size = "4vs",
  displayLabel = true,
  displayPoint = true,
  labelDirection = -Math.PI / 2,
  label = ([x, y]: [number, number]) => `(${round(x, 3)}, ${round(y, 3)})`,
  weight = "secondary",
  shade,
  ...rest
}: MarkProps) => {
  const { computeCoord, computeNumber } = useGraph();
  const {
    fillColor,

    fontSize,
    fontFamily,
    fontWeight,
  } = useTheme(weight, rest, shade);
  const computedSize = computeNumber(size);
  const [absX, absY] = computeCoord(pos);
  const labelDistance = computedSize / 2 + 10;
  const labelX = labelDistance * Math.cos(labelDirection);
  const labelY = labelDistance * Math.sin(labelDirection);

  return (
    <g transform={`translate(${absX} ${absY})`}>
      {displayLabel && (
        <text
          x={labelX}
          y={labelY}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          textAnchor={"middle"}
          dominantBaseline={"middle"}
          fill={fillColor}
        >
          {label(pos)}
        </text>
      )}
      {displayPoint && <circle r={computedSize / 2} fill={fillColor} />}
    </g>
  );
};
