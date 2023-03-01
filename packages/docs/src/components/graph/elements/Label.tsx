import { isArray } from "lodash";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { useGraph } from "../providers";
import { Color } from "../utils/styles";
import { NumberUnit, NumberUnitPoint } from "../utils";
import { Text } from "./Text";
import { Point } from "math";

import { LabelContainer, LabelContainerProps } from "./LabelContainer";

export type LabelProps = {
  content: string;
  color?: Color;
  fontFamily?: string;
  fontSize?: NumberUnit;
  fontWeight?: number | string;
  padding?: NumberUnit | NumberUnitPoint;
  lineHeight?: number;
  alignment?: "left" | "center" | "right";
} & Omit<LabelContainerProps, "size" | "children">;

export const Label = ({
  labelPos,
  padding = [10, 10],
  content = "",
  lineHeight = 1.2,
  fontFamily,
  fontSize,
  fontWeight,
  color, // text color
  strokeColor,
  alignment = "center",

  ...rest
}: LabelProps) => {
  const [[width, height], setSize] = useState<Point>([0, 0]);

  const contentRef = React.useRef<SVGTextElement>(null);
  const { computeSize, width: graphWidth } = useGraph();

  const [xPadding, yPadding] = computeSize(
    isArray(padding) ? padding : [padding, padding],
    "vs"
  );
  useLayoutEffect(() => {
    if (!contentRef.current) {
      return;
    }
    const { width, height } = contentRef.current.getBoundingClientRect();
    setSize([width + xPadding * 2, height + yPadding * 2]);
  }, [contentRef.current, content, fontSize, lineHeight, graphWidth]);

  return (
    <LabelContainer
      size={[`${width}vs`, `${height}vs`]}
      strokeColor={strokeColor || color}
      {...rest}
    >
      <Text
        transform={useMemo(() => {
          let textX = xPadding;
          if (alignment === "right") {
            textX = width - xPadding;
          } else if (alignment === "center") {
            textX = width / 2;
          }
          return `translate(${textX} ${yPadding})`;
        }, [width, xPadding, yPadding, alignment])}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={fontWeight}
        color={color}
      >
        <tspan
          x="0"
          dy="1em"
          ref={contentRef}
          textAnchor={useMemo(() => {
            if (alignment === "left") {
              return "start";
            } else if (alignment === "right") {
              return "end";
            } else {
              return "middle";
            }
          }, [alignment])}
          alignmentBaseline="after-edge"
        >
          {content}
        </tspan>
      </Text>
    </LabelContainer>
  );
};
