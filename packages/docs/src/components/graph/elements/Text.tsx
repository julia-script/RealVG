import { round } from "lodash";
import React from "react";
import { useGraph } from "../providers";
import { Color } from "../utils/styles";
import { NumberUnit, NumberUnitPoint } from "../utils";

export type TextProps = {
  pos?: NumberUnitPoint;
  fontSize?: NumberUnit;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: Color;
  children?: React.ReactNode;
} & React.SVGProps<SVGTextElement>;

export const Text = ({
  children,
  fontSize,
  fontWeight,
  color,
  fontFamily,
  pos,
  ...rest
}: TextProps) => {
  const { computeCoord, computeNumber, theme, computeColor } = useGraph();
  const [x, y] = pos ? computeCoord(pos) : [0, 0];

  return (
    <text
      x={x}
      y={y}
      fontSize={computeNumber(fontSize || theme.fontSize, "vs")}
      fontFamily={fontFamily || theme.fontFamily}
      fontWeight={fontWeight || theme.fontWeight}
      fill={computeColor(color || theme.fontColor)}
      {...rest}
    >
      {children}
    </text>
  );
};
