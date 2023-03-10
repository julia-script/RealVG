import { isArray, round } from "lodash";
import React, { useMemo } from "react";
import { useGraph } from "../providers";
import { Label } from "./Label";
import { PolyLine } from "./Polyline";
import { Text } from "./Text";

type GridProps = {};

export const Grid = ({}: GridProps) => {
  const { width, height, visibleCoordBox } = useGraph();

  const { coordStep, theme } = useGraph();

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

  const gridLinesStyle = useMemo(() => {
    return {
      color: theme.grid.lines,
      width: theme.grid.linesStrokeWidth,
    };
  }, [theme]);

  const xAxisColor = isArray(theme.grid.axis)
    ? theme.grid.axis[0]
    : theme.grid.axis;

  const yAxisColor = isArray(theme.grid.axis)
    ? theme.grid.axis[1]
    : theme.grid.axis;

  return (
    <g>
      {ySteps.map((relY, i) => (
        <g key={i}>
          <PolyLine
            points={["0vs", relY, `${width}vs`, relY]}
            {...gridLinesStyle}
          />

          <Label
            pos={[`0cs`, relY]}
            direction={relY ? "w" : "sw"}
            content={`${round(relY, 2)}`}
            distance={6}
            padding={4}
            boxed={false}
            arrow={false}
            strokeColor={xAxisColor}
            strokeWidth={gridLinesStyle.width}
          />
        </g>
      ))}
      {xSteps.map((relX, i) => (
        <g key={relX}>
          <PolyLine
            points={[relX, "0vs", relX, `${height}vs`]}
            {...gridLinesStyle}
          />
          {relX && (
            <Label
              pos={[relX, `0cs`]}
              content={`${round(relX, 2)}`}
              direction="s"
              distance={6}
              padding={4}
              boxed={false}
              arrow={false}
              strokeColor={yAxisColor}
              strokeWidth={gridLinesStyle.width}
            />
          )}
        </g>
      ))}
      <PolyLine
        points={[0, startY, 0, endY]}
        color={yAxisColor}
        width={theme.grid.axisStrokeWidth}
      />
      <PolyLine
        points={[startX, 0, endX, 0]}
        color={xAxisColor}
        width={theme.grid.axisStrokeWidth}
      />
    </g>
  );
};
