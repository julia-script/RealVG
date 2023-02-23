import { inverseLerp } from "math";
import { ComputedThemeWeightDefinitions, ThemeWeights } from "./theme-provider";

export const axisCoordToViewSpace = (
  coord: number,
  coordRange: [number, number],
  viewSpaceSize
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
  //scale to fit
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
//  & Partial<ThemeWeightDefinitions> & T
