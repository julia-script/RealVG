import { round } from "lodash";
import React from "react";
import { useGraph, useTheme } from "../providers";
import { GraphNodeProps, NumberUnit, NumberUnitPoint } from "../utils";

export type MarkProps = {
  pos: NumberUnitPoint;
  size?: NumberUnit;
  displayLabel?: boolean;
  displayPoint?: boolean;
  labelDirection?: number;
  onDrag?: (pos: [number, number]) => void;
  label?: (pos: [number, number]) => string;
} & GraphNodeProps;

export const Mark = ({
  pos,
  size = "12vs",
  displayLabel = true,
  displayPoint = true,
  labelDirection = -Math.PI / 2,
  label = ([x, y]: [number, number]) => `(${round(x, 3)}, ${round(y, 3)})`,
  onDrag,
  weight = "secondary",
  shade,
  ...rest
}: MarkProps) => {
  const [dragging, setDragging] = React.useState(false);
  const { computeCoord, computeNumber, computeSizeToCoordSpace } = useGraph();
  const { fillColor } = useTheme(weight, rest, shade);

  const computedSize = computeNumber(size);

  const [absX, absY] = computeCoord(pos);
  const labelDistance = computedSize / 2 + 10;
  const labelX = labelDistance * Math.cos(labelDirection);
  const labelY = labelDistance * Math.sin(labelDirection);

  return (
    <g
      transform={`translate(${absX} ${absY})`}
      onPointerDown={(e) => {
        (e.target as SVGGElement).setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;

        const [offsetX, offsetY] = computeSizeToCoordSpace([
          e.movementX, // * xMultiplier,
          e.movementY, // * yMultiplier,
        ]);

        onDrag?.([offsetX, offsetY]);
      }}
      onPointerUp={(e) => {
        (e.target as SVGGElement).releasePointerCapture(e.pointerId);
        setDragging(false);
      }}
    >
      {/* {displayLabel && (
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
      )} */}
      {displayPoint && (
        <g style={onDrag ? { cursor: "pointer" } : {}}>
          {onDrag && (
            <circle r={computedSize * 1.5} fill={fillColor} opacity={0.15} />
          )}
          <circle r={computedSize / 2} fill={fillColor} />
        </g>
      )}
    </g>
  );
};
