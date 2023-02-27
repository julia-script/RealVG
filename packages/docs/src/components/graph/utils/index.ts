import { inverseLerp, lerp, remap } from "math";
import { ComputedThemeWeightDefinitions, ThemeWeights } from "../providers";

export const axisCoordToViewSpace = (
  coord: number,
  coordRange: [number, number],
  viewSpaceSize: number
) => {
  const [start, end] = coordRange;
  return inverseLerp(start, end, coord) * viewSpaceSize;
};

export const coordBoxFromRanges = (
  xRange: [number, number],
  yRange: [number, number]
): [number, number, number, number] => {
  const [xStart, xEnd] = xRange;
  const [yStart, yEnd] = yRange;

  return [
    Math.min(xStart, xEnd),
    Math.min(yStart, yEnd),
    Math.max(xStart, xEnd),
    Math.max(yStart, yEnd),
  ];
};

export const rangesFromCoordBox = (
  coordBox: [number, number, number, number],
  viewSize: [number, number]
): [[number, number], [number, number]] => {
  const [xStart, yStart, xEnd, yEnd] = coordBox;
  const [width, height] = viewSize;

  const bboxHeight = Math.max(yEnd, yStart) - Math.min(yEnd, yStart);
  const bboxWidth = Math.max(xEnd, xStart) - Math.min(xEnd, xStart);

  const xRatio = width / bboxWidth;
  const yRatio = height / bboxHeight;

  const ratio = Math.min(xRatio, yRatio);

  const xRange: [number, number] = [
    (xStart * xRatio) / ratio,
    (xEnd * xRatio) / ratio,
  ];
  const yRange: [number, number] = [
    (yStart * yRatio) / ratio,
    (yEnd * yRatio) / ratio,
  ];

  return [xRange, yRange];
};

export type NumberUnit = `${number}vs` | `${number}cs` | number; // view space, coord space, number defaults according to context

export type NumberUnitPoint = [NumberUnit, NumberUnit];

export const parseNumberUnit = (
  value: NumberUnit,
  defaultSpace: "vs" | "cs" = "cs"
): [number, "vs" | "cs"] => {
  if (typeof value === "number") {
    return [value, defaultSpace];
  }
  const unit = value.slice(-2);
  const number = parseFloat(value.slice(0, -2));
  return [number, unit as "vs" | "cs"];
};

export interface GraphNodeProps
  extends Partial<ComputedThemeWeightDefinitions> {
  weight?: ThemeWeights;
  shade?: 0 | 1 | 2 | 3;
}

export type BBox = {
  x: [number, number];
  y: [number, number];
};
export const calculateVisibleCoordBox = (
  viewSize: [number, number],

  coordBox: {
    x: [number, number];
    y: [number, number];
  },
  stepSize: [number, number],
  padding: [number, number] = [0, 0]
): BBox => {
  const [xPadding, yPadding] = padding;

  const [width, height] = viewSize;
  let [xStart, xEnd] = coordBox.x;
  let [yStart, yEnd] = coordBox.y;
  const [xStep, yStep] = stepSize;

  if (xPadding > 0) {
    const xMultiplier = (width + xPadding * 2) / width / 2 + 0.5;
    xStart = lerp(xEnd, xStart, xMultiplier);
    xEnd = lerp(xStart, xEnd, xMultiplier);
  }

  if (yPadding > 0) {
    const yMultiplier = (height + yPadding * 2) / height / 2 + 0.5;
    yStart = lerp(yEnd, yStart, yMultiplier);
    yEnd = lerp(yStart, yEnd, yMultiplier);
  }

  let coordHeight = Math.max(yEnd, yStart) - Math.min(yEnd, yStart);
  let coordWidth = Math.max(xEnd, xStart) - Math.min(xEnd, xStart);

  const viewRatio = width / height;
  const coordRatio = coordWidth / xStep / (coordHeight / yStep);

  if (viewRatio < coordRatio) {
    const ty = coordRatio / viewRatio / 2 + 0.5;
    return {
      x: [xStart, xEnd],
      y: [lerp(yEnd, yStart, ty), lerp(yStart, yEnd, ty)],
    };
  }

  const tx = viewRatio / coordRatio / 2 + 0.5;

  return {
    x: [lerp(xEnd, xStart, tx), lerp(xStart, xEnd, tx)],
    y: [yStart, yEnd],
  };
};
