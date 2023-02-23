import React from "react";
import { lerp, inverseLerp } from "math";
import { useGraph } from "./graph-provider";
import { Line } from "./line";

type GridProps = {
  gridStep?: number;
};

const generateStepArray = (start: number, end: number, step: number) => {
  const steps: number[] = [];
  if (end < start) {
    const temp = end;
    end = start;
    start = temp;
  }
  const startStep = start - (start % step);
  for (let i = startStep; i <= end; i += step) {
    steps.push(i);
  }
  return steps;
};

export const Grid = ({ gridStep = 1 }: GridProps) => {
  const {
    yRange: [startY, endY],
    xRange: [startX, endX],
    width,
    height,
  } = useGraph();

  return (
    <g>
      {generateStepArray(startY, endY, gridStep).map((relY, i) => (
        <Line
          key={i}
          weight={"extraLight"}
          start={["0vs", relY]}
          end={[`${width}vs`, relY]}
        />
      ))}
      {generateStepArray(startX, endX, gridStep).map((relX, i) => (
        <Line
          key={i}
          weight={"extraLight"}
          start={[relX, "0vs"]}
          end={[relX, `${height}vs`]}
        />
      ))}
      <Line weight={"light"} start={[0, startY]} end={[0, endY]} />
      <Line weight={"light"} start={[startX, 0]} end={[endX, 0]} />
    </g>
  );
};
