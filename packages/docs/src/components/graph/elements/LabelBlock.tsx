import { isArray } from "lodash";
import React, { useLayoutEffect, useMemo, useState } from "react";
import { useGraph } from "../providers";
import { Color } from "../utils/styles";
import { NumberUnit, NumberUnitPoint } from "../utils";
import { Text } from "./Text";
import { Point } from "math";

import { LabelContainer, LabelContainerProps } from "./LabelContainer";

export type LabelBlockProps = {
  color?: Color;
  width?: NumberUnit;
  fontFamily?: string;
  fontSize?: NumberUnit;
  fontWeight?: number | string;
  padding?: NumberUnit | NumberUnitPoint;
  lineHeight?: number;
  alignment?: "left" | "center" | "right";
} & Omit<LabelContainerProps, "size">;

export const LabelBlock = ({
  padding = [10, 10],
  width = 200,
  lineHeight = 1.2,
  fontFamily,
  fontSize,
  fontWeight,
  color, // text color
  strokeColor,
  alignment = "center",
  children,
  ...rest
}: LabelBlockProps) => {
  const [height, setHeight] = useState(0);

  const contentRef = React.useRef<HTMLDivElement>(null);
  const { computeSize, width: graphWidth, theme, computeColor } = useGraph();
  const fontColor = computeColor(color || strokeColor || theme.fontColor);
  const [xPadding, yPadding] = computeSize(
    isArray(padding) ? padding : [padding, padding],
    "vs"
  );
  useLayoutEffect(() => {
    if (!contentRef.current) {
      return;
    }
    const { width, height } = contentRef.current.getBoundingClientRect();
    setHeight(height);
  }, [contentRef.current, fontSize, lineHeight, graphWidth, children]);

  return (
    <LabelContainer
      size={[width, `${height}vs`]}
      strokeColor={strokeColor || color}
      {...rest}
    >
      <foreignObject width={width} height={height}>
        <div
          ref={contentRef}
          style={{
            padding: `${yPadding}px ${xPadding}px`,
            fontFamily: fontFamily || theme.fontFamily,
            fontSize: fontSize || theme.fontSize,
            fontWeight: fontWeight || theme.fontWeight,
            lineHeight: lineHeight,
            color: fontColor,
            textAlign: alignment,
          }}
        >
          {children}
        </div>
      </foreignObject>
    </LabelContainer>
  );
};
