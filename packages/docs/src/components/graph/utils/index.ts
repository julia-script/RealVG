import { lerp, Point } from "math";
import { GraphContextProps } from "../providers";

export type NumberUnit = `${number}vs` | `${number}cs` | number; // view space, coord space, number defaults according to context

export type NumberUnitPoint = [NumberUnit, NumberUnit];

export type NormalizedBBox = {
  x: Point;
  y: Point;
};
export type BBox = NormalizedBBox | [number, number, number, number];

export const normalizeBBox = (bbox: BBox): NormalizedBBox => {
  if (Array.isArray(bbox)) {
    return {
      x: [bbox[0], bbox[2]],
      y: [bbox[1], bbox[3]],
    };
  }
  return bbox;
};
type Handler = (e: React.PointerEvent, graph: GraphContextProps) => void;
export type WithPointerEvents = {
  onPointerMove?: Handler;
  onPointerDown?: Handler;
  onPointerUp?: Handler;
  interactable?: boolean;
};
export const mapPointerEvent =
  (graph: GraphContextProps, handler?: Handler) => (e: React.PointerEvent) => {
    if (handler) {
      handler(e, graph);
    }
  };

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

export const calculateVisibleCoordBox = (
  viewSize: Point,

  coordBox: NormalizedBBox,
  stepSize: Point,
  padding: Point = [0, 0]
): NormalizedBBox => {
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
