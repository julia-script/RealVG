import { isArray, isNaN, isNumber, round } from "lodash";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useGraph } from "../providers";
import { Color } from "../utils/styles";
import { NormalizedBBox, NumberUnit, NumberUnitPoint } from "../utils";
import { TextProps, Text } from "./Text";
import { Point } from "math";
import { Rect } from "./Rect";
import { Line } from "./Line";
import { Mark } from "./Mark";

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
export type LabelProps = {
  labelPos?: NumberUnitPoint;
  radius?: NumberUnit;
  direction?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw" | number;
  strokeWidth?: NumberUnit;
  strokeColor?: Color;
  distance?: NumberUnit;
  padding?: NumberUnit | NumberUnitPoint;
  arrow?: boolean;
  indicationLine?: boolean;
  indicationLineOffset?: NumberUnit;
  boxed?: boolean;
  color?: Color;
  backgroundColor?: Color;
  textColor?: Color;
  content?: string;
  lineHeight?: number;

  alignment?: "left" | "center" | "right";
} & Omit<TextProps, "children">;

export const radiansToRectEdge = (
  radians: number,
  width: number,
  height: number
): Point => {
  if (width === 0 || height === 0) {
    return [0, 0];
  }
  const x = Math.cos(radians);
  const y = Math.sin(radians);

  const xAbs = Math.abs(x);
  const yAbs = Math.abs(y);

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const ratio = width / height;
  const invertedRatio = height / width;

  if (xAbs / ratio > yAbs) {
    const xSign = Math.sign(x);
    return [halfWidth * xSign, (y / x) * halfHeight * ratio * xSign];
  }

  const ySign = Math.sign(y);
  return [(x / y) * halfWidth * invertedRatio * ySign, halfHeight * ySign];
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
export const Label = ({
  pos = [0, 0],
  labelPos,
  padding = [10, 10],
  content = "",
  lineHeight = 1.2,
  fontFamily,
  fontSize,
  fontWeight,
  color, // text color
  arrow = true,
  backgroundColor,
  textColor,
  strokeColor,
  strokeWidth = 2,
  indicationLine = true,
  indicationLineOffset = 20,
  boxed = true,
  alignment = "center",
  direction = "n",
  distance = 40,
  radius = 15,
  ...rest
}: LabelProps) => {
  const [[width, height], setSize] = useState<Point>([0, 0]);

  const contentRef = React.useRef<SVGTextElement>(null);
  const {
    computeCoord,
    computeNumber,
    computeSize,
    width: graphWidth,
  } = useGraph();

  const indicationLineOffsetVs = computeNumber(indicationLineOffset, "vs");

  const {
    labelPos: [labelX, labelY],
    targetPos: [targetX, targetY],
    attachingPoint,
    distanceVs,
  } = useMemo(() => {
    const [targetX, targetY] = computeCoord(pos);

    if (labelPos) {
      const [labelX, labelY] = computeCoord(labelPos);
      const directionInRadians = Math.atan2(labelY - targetY, labelX - targetX);

      let attachingPoint = radiansToRectEdge(directionInRadians, width, height);

      attachingPoint = [labelX - attachingPoint[0], labelY - attachingPoint[1]];
      let distanceVs = Math.sqrt(
        Math.pow(attachingPoint[0] - targetX, 2) +
          Math.pow(attachingPoint[1] - targetY, 2)
      );

      return {
        labelPos: [labelX, labelY],
        targetPos: [targetX, targetY],
        attachingPoint,
        distanceVs,
      };
    }

    const directionInRadians = isNumber(direction)
      ? direction
      : CardinalRadians[direction];
    const distanceVs = computeNumber(distance, "vs");
    let attachingPoint = radiansToRectEdge(directionInRadians, width, height);
    const [dirX, dirY] = [
      Math.cos(directionInRadians),
      Math.sin(directionInRadians),
    ];

    const [labelX, labelY] = [
      attachingPoint[0] + targetX + dirX * distanceVs,
      attachingPoint[1] + targetY + dirY * distanceVs,
    ];
    attachingPoint = [labelX - attachingPoint[0], labelY - attachingPoint[1]];

    return {
      attachingPoint,
      labelPos: [labelX, labelY],
      targetPos: [targetX, targetY],
      distanceVs,
    };
  }, [direction, labelPos, pos, computeCoord, width, height, distance]);

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

  const arrowEndPos = useMemo(() => {
    const direction = Math.atan2(
      targetY - attachingPoint[1],
      targetX - attachingPoint[0]
    );

    return [
      targetX - Math.cos(direction) * indicationLineOffsetVs,
      targetY - Math.sin(direction) * indicationLineOffsetVs,
    ];
  }, [indicationLineOffsetVs, distanceVs, targetX, targetY]);
  return (
    <>
      {indicationLine && distanceVs > indicationLineOffsetVs && (
        <Line
          start={[`${attachingPoint[0]}vs`, `${attachingPoint[1]}vs`]}
          end={[`${arrowEndPos[0]}vs`, `${arrowEndPos[1]}vs`]}
          color={strokeColor || color}
          width={strokeWidth}
          arrow={arrow}
        />
      )}
      <g
        transform={useMemo(() => {
          return `translate(${labelX - width / 2} ${labelY - height / 2})`;
        }, [width, height, labelX, labelY])}
      >
        {boxed && (
          <Rect
            pos={[`0vs`, `0vs`]}
            size={[`${width}vs`, `${height}vs`]}
            radius={radius}
            strokeWidth={strokeWidth}
            color={strokeColor || color}
            fill={backgroundColor}
          />
        )}
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
          {...rest}
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
      </g>
    </>
  );
};
