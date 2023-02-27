import { round } from "lodash";
import React, { useMemo } from "react";
import { useGraph } from "../providers";
import { BBoxRect } from "./BBoxRect";
import { Line } from "./Line";
import { Rect } from "./Rect";
import { Text } from "./Text";

type GridProps = {};

export const Grid = ({}: GridProps) => {
  const { width, height, visibleCoordBox } = useGraph();

  const { coordStep } = useGraph();

  const [startX, endX] = visibleCoordBox.x;
  const [startY, endY] = visibleCoordBox.y;

  const [xGridStep, yGridStep] = useMemo(() => {
    const minStepSizeInPx = 50;
    const [coordStepX, coordStepY] = coordStep;

    const widthInCoords = Math.max(startX, endX) - Math.min(startX, endX);
    const heightInCoords = Math.max(startY, endY) - Math.min(startY, endY);

    return [
      Math.floor(((widthInCoords / width) * minStepSizeInPx) / coordStepX) *
        coordStepX,
      Math.floor(((heightInCoords / height) * minStepSizeInPx) / coordStepY) *
        coordStepY,
    ];
  }, [visibleCoordBox, width, height]);

  const xSteps = useMemo(() => {
    const steps: number[] = [];
    const [start, end] = startX < endX ? [startX, endX] : [endX, startX];

    for (let i = start - (start % xGridStep); i <= end; i += xGridStep) {
      steps.push(i);
    }
    return steps;
  }, [startX, endX, xGridStep]);

  const ySteps = useMemo(() => {
    const steps: number[] = [];

    const [start, end] = startY < endY ? [startY, endY] : [endY, startY];

    for (let i = start - (start % yGridStep); i <= end; i += yGridStep) {
      steps.push(i);
    }
    return steps;
  }, [startY, endY, yGridStep]);

  return (
    <g>
      {/* <BBoxRect bbox={coordBox} /> */}
      <Line weight={"light"} start={[0, startY]} end={[0, endY]} />
      <Line weight={"light"} start={[startX, 0]} end={[endX, 0]} />
      {ySteps.map((relY, i) => (
        <g key={i}>
          <Line
            weight={"extraLight"}
            start={["0vs", relY]}
            end={[`${width}vs`, relY]}
          />
          <Text position={[`0cs`, relY]}>{round(relY, 2)}</Text>
        </g>
      ))}
      {xSteps.map((relX, i) => (
        <g key={i}>
          <Line
            weight={"extraLight"}
            start={[relX, "0vs"]}
            end={[relX, `${height}vs`]}
          />
          <Text position={[relX, `0cs`]}>{round(relX, 2)}</Text>
        </g>
      ))}
    </g>
  );
};
