import React, { useCallback } from "react";
import { useGraph } from "../providers";
import { Color } from "../utils/styles";
import {
  mapPointerEvent,
  NumberUnit,
  NumberUnitPoint,
  WithPointerEvents,
} from "../utils";
import { isNumber, isString } from "lodash";
import { Text } from "./Text";
import { Point } from "math";

export type MarkProps = {
  pos: NumberUnitPoint;
  size?: NumberUnit;
  color?: Color;
  displayLabel?: boolean;
  displayPoint?: boolean;
  labelDirection?: number;
  component?:
    | string
    | ((size: number, color: string, interactable: boolean) => React.ReactNode);
} & WithPointerEvents;

export const Mark = ({
  pos,
  size,
  color = 1,
  displayPoint = true,

  component = (size, color, interactable) => (
    <g>
      {interactable && <circle r={size * 1.5} fill={color} opacity={0.15} />}
      <circle r={size / 2} fill={color} />
    </g>
  ),
  onPointerDown,
  onPointerMove,
  onPointerUp,
  interactable,
}: MarkProps) => {
  const graph = useGraph();
  const { computeCoord, computeNumber, computeColor } = useGraph();
  const fillColor = computeColor(color);
  const computedSize = computeNumber(size || 12, "vs");
  const [absX, absY] = computeCoord(pos);
  return (
    <g
      transform={`translate(${absX} ${absY})`}
      onPointerDown={mapPointerEvent(graph, onPointerDown)}
      onPointerMove={mapPointerEvent(graph, onPointerMove)}
      onPointerUp={mapPointerEvent(graph, onPointerUp)}
    >
      {displayPoint && (
        <g style={interactable ? { cursor: "pointer" } : {}}>
          {isString(component)
            ? textMark(computedSize, fillColor, !!interactable, component)
            : component(computedSize, fillColor, !!interactable)}
        </g>
      )}
    </g>
  );
};

const textMark = (
  size: number,
  color: string,
  interactable: boolean,
  text: string
) => {
  const fontSize = size * 1.8;
  return (
    <>
      {interactable && <circle r={size * 1.5} fill={color} opacity={0.4} />}
      <circle r={size * 1.1} fill={color} opacity={0.8} />
      <Text
        fontSize={fontSize}
        textAnchor={"middle"}
        dy={"0.65em"}
        dominantBaseline={"middle"}
        y={-fontSize / 2}
      >
        {text}
      </Text>
    </>
  );
};
