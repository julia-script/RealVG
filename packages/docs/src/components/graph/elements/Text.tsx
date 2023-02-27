import { round } from "lodash";
import React from "react";
import { useGraph, useTheme } from "../providers";
import { GraphNodeProps, NumberUnit, NumberUnitPoint } from "../utils";

export type TextProps = {
  position: NumberUnitPoint;
  children?: React.ReactNode;
} & GraphNodeProps;

export const Text = ({
  weight = "secondary",
  shade,
  children,
  ...rest
}: TextProps) => {
  const { computeCoord, computeNumber } = useGraph();
  const [x, y] = computeCoord(rest.position);
  const {
    fillColor,

    fontSize,
    fontFamily,
    fontWeight,
  } = useTheme(weight, rest, shade);

  return (
    <text
      x={x}
      y={y}
      fontSize={12}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      textAnchor={"middle"}
      dominantBaseline={"middle"}
      fill={fillColor}
    >
      {children}
    </text>
  );
};
