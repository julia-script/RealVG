import { isArray, round } from "lodash";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useGraph } from "../providers";
import { Color } from "../utils/styles";
import { NormalizedBBox, NumberUnit, NumberUnitPoint } from "../utils";
import { TextProps, Text } from "./Text";
import { Point } from "math";
import { Rect } from "./Rect";
import { Line } from "./Line";

const CardinalRadians = {
  n: -Math.PI / 2,
  ne: -Math.PI / 4,
  e: 0,
  se: Math.PI / 4,
  s: Math.PI / 2,
  sw: (3 * Math.PI) / 4,
  w: Math.PI,
  nw: (-3 * Math.PI) / 4,
};
export type BlockLabelProps = {
  radius?: NumberUnit;
  direction?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw" | number;
  strokeWidth?: NumberUnit;
  stroke?: Color;
  distance?: NumberUnit;
  maxWidth?: NumberUnit;
  padding?: NumberUnit | NumberUnitPoint;
  arrow?: boolean;
  color?: Color;
  fill?: Color;
  textColor?: Color;
  content?: string;
  lineHeight?: number;
  alignment?: "left" | "center" | "right";
} & TextProps;

// void ellipticalDiscToSquare(double u, double v, double& x, double& y)
// {
//     double u2 = u * u;
//     double v2 = v * v;
//     double twosqrt2 = 2.0 * sqrt(2.0);
//     double subtermx = 2.0 + u2 - v2;
//     double subtermy = 2.0 - u2 + v2;
//     double termx1 = subtermx + u * twosqrt2;
//     double termx2 = subtermx - u * twosqrt2;
//     double termy1 = subtermy + v * twosqrt2;
//     double termy2 = subtermy - v * twosqrt2;
//     x = 0.5 * sqrt(termx1) - 0.5 * sqrt(termx2);
//     y = 0.5 * sqrt(termy1) - 0.5 * sqrt(termy2);

// }
const twosqrt2 = 2.0 * Math.sqrt(2.0);
const ellipticalDiscToSquare = (point: Point): Point => {
  const [u, v] = point;
  const u2 = u * u;
  const v2 = v * v;

  const subtermx = 2.0 + u2 - v2;
  const subtermy = 2.0 - u2 + v2;
  const termx1 = subtermx + u * twosqrt2;
  const termx2 = subtermx - u * twosqrt2;
  const termy1 = subtermy + v * twosqrt2;
  const termy2 = subtermy - v * twosqrt2;
  const x = 0.5 * Math.sqrt(termx1) - 0.5 * Math.sqrt(termx2);
  const y = 0.5 * Math.sqrt(termy1) - 0.5 * Math.sqrt(termy2);
  return [x, y];
};

const radiansToSquare = (radians: number): Point => {
  const x = Math.cos(radians);
  const y = Math.sin(radians);
  const xAbs = Math.abs(x);
  const yAbs = Math.abs(y);

  if (xAbs > yAbs) {
    return [Math.sign(x), y * twosqrt2];
  }
  return [x * twosqrt2, Math.sign(y)];
};

export const unitCircleToUnitSquare = (point: Point): Point => {
  const [u, v] = point;
  const u2 = u * u;
  const v2 = v * v;
  const x = (u * (1 + u2)) / (1 + u2 + v2);
  const y = (v * (1 + v2)) / (1 + u2 + v2);
  return [x, y];
};

const trimLineBreaks = (text: string) => {
  return text.replace(/^\s+|\s+$/g, "");
};
export const BlockLabel = ({
  children,
  pos,
  maxWidth = 200,
  padding = [10, 10],
  content = "",
  lineHeight = 1.2,
  fontFamily,
  fontSize,
  fontWeight,
  color,
  fill,
  textColor,
  stroke,
  strokeWidth,
  alignment = "center",
  direction = "n",
  distance = 40,
  radius = 15,
  ...rest
}: BlockLabelProps) => {
  const [[width, height], setSize] = useState<Point>([0, 0]);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<SVGTextElement>(null);
  const {
    computeCoord,
    computeNumber,
    theme,
    computeColor,
    computeSize,
    width: graphWidth,
  } = useGraph();

  const [x, y] = pos ? computeCoord(pos) : [0, 0];

  const [xPadding, yPadding] = computeSize(
    isArray(padding) ? padding : [padding, padding],
    "vs"
  );

  const computedTextColor = computeColor(textColor ?? theme.fontColor);
  const maxWidthPx = computeNumber(maxWidth, "vs");

  const fontSizePx = computeNumber(fontSize || theme.fontSize, "vs");
  const distanceVs = computeNumber(distance, "vs");

  useLayoutEffect(() => {
    if (!textRef.current) {
      return;
    }
    textRef.current.innerHTML = "";

    const contentArray = content
      .split("\n")
      .map((line) => line.trim().split(" "));
    const createTspan = () => {
      const tspan = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "tspan"
      );
      tspan.setAttribute("x", "0");

      tspan.setAttribute("dy", `${lineHeight}em`);
      tspan.setAttribute("dominant-baseline", "text-after-edge");
      tspan.setAttribute("text-anchor", "middle");
      if (alignment === "left") {
        tspan.setAttribute("text-anchor", "start");
      } else if (alignment === "right") {
        tspan.setAttribute("text-anchor", "end");
      } else {
        tspan.setAttribute("text-anchor", "middle");
      }

      return tspan;
    };

    let lineCount = 0;
    let contentWidth = 0;
    const maxLineWidth = maxWidthPx - 2 * xPadding;

    contentArray.forEach((line, i) => {
      let currentTspan: SVGTSpanElement = createTspan();
      textRef.current?.append(currentTspan);
      lineCount++;
      line.map((word) => {
        const textNode = document.createTextNode(i === 0 ? word : ` ${word}`);
        currentTspan.append(textNode);
        const { width } = currentTspan.getBBox();
        if (width > contentWidth) contentWidth = Math.min(maxLineWidth, width);

        if (width < maxLineWidth) {
          return;
        }
        lineCount++;
        textNode.remove();
        currentTspan = createTspan();
        currentTspan.append(word);
        textRef.current?.append(currentTspan);
      });
    });

    setSize([
      contentWidth + xPadding * 2,
      lineCount * lineHeight * fontSizePx + yPadding * 2,
    ]);
  }, [
    contentRef.current,
    content,
    fontSize,
    lineHeight,
    maxWidthPx,
    graphWidth,
  ]);

  let textX = xPadding;
  if (alignment === "right") {
    textX = width - xPadding;
  } else if (alignment === "center") {
    textX = width / 2;
  }

  const directionInRadians = useMemo(() => {
    if (typeof direction === "number") {
      return direction;
    }
    return CardinalRadians[direction];
  }, [direction]);

  const [unitX, unitY] = radiansToSquare(directionInRadians);

  const [halfX, halfY] = [width / 2, height / 2];

  const [blockX, blockY] = [
    unitX * (halfX + distanceVs) - halfX,
    unitY * (halfY + distanceVs) - halfY,
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      <Line
        end={["0vs", "0vs"]}
        start={[`${unitX * distanceVs}vs`, `${unitY * distanceVs}vs`]}
        color={stroke}
        width={strokeWidth}
      />
      <g transform={`translate(${blockX} ${blockY})`}>
        <Rect
          pos={[`0vs`, `0vs`]}
          size={[`${width}vs`, `${height}vs`]}
          radius={radius}
          strokeWidth={strokeWidth}
          color={stroke}
          fill={fill}
        />
        <text
          transform={`translate(${textX} ${yPadding})`}
          fontSize={fontSizePx}
          fontFamily={fontFamily || theme.fontFamily}
          fontWeight={fontWeight || theme.fontWeight}
          fill={computedTextColor}
          ref={textRef}
          width={width}
          height={height}
          {...rest}
        />
      </g>
    </g>
  );
};
