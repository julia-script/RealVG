import React from "react";
import { GraphNodeProps, NumberUnitPoint } from "../utils";
import { useGraph, useTheme } from "../providers";

type LineProps = {
  start: NumberUnitPoint;
  end: NumberUnitPoint;
  arrow?: boolean;
  label?: string;
} & GraphNodeProps;

export const Line = ({
  start,
  end,
  arrow = false,
  label,
  weight = "regular",
  shade,
  ...rest
}: LineProps) => {
  const { computeCoord } = useGraph();
  const {
    strokeColor,
    strokeWidth,
    strokeDashArray,
    opacity,
    fontFamily,
    fontSize,
  } = useTheme(weight, rest, shade);

  const [x1, y1] = computeCoord(start);
  const [x2, y2] = computeCoord(end);

  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const arrowSize = 3;
  return (
    <g opacity={opacity}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDashArray.join(" ")}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {arrow && (
        <polygon
          points={`${x2},${y2} ${
            x2 - arrowSize * Math.cos(((angle - 45) * Math.PI) / 180)
          },${y2 - arrowSize * Math.sin(((angle - 45) * Math.PI) / 180)} ${
            x2 - arrowSize * Math.cos(((angle + 45) * Math.PI) / 180)
          },${y2 - arrowSize * Math.sin(((angle + 45) * Math.PI) / 180)}`}
          stroke={strokeColor}
          fill={strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2}
          fontSize={fontSize}
          fill={strokeColor}
          fontFamily={fontFamily}
          fontWeight={700}
          textAnchor={"middle"}
          dominantBaseline={"middle"}
        >
          {label}
        </text>
      )}
    </g>
  );
};
