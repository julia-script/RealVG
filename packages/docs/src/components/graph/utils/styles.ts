import { NumberUnit } from ".";

export interface Theme {
  background: string;
  fontSize: NumberUnit;
  fontWeight: number | string;
  fontFamily: string;
  fontColor: string;

  grid: {
    lines: string;
    linesStrokeWidth: NumberUnit;
    axis: string | [string, string];
    axisStrokeWidth: NumberUnit;
    labels: string | [string, string];
    labelsFontSize: NumberUnit;
  };
  palette: [string, ...string[]];
}
export const darkTheme: Theme = {
  background: "#1c1e21",
  fontSize: 12,
  fontWeight: 400,
  fontFamily: "monospace",
  fontColor: "#fff",
  grid: {
    lines: "#2c2e31",
    linesStrokeWidth: 1,
    axis: "#797e86",
    axisStrokeWidth: 3,
    labels: ["#2c2e31", "#2c2e31"],
    labelsFontSize: 12,
  },
  palette: ["#F5EAEA", "#FFB84C", "#FCE22A", "#5cb7b6", "#F16767"],
};

export type Color = string | number;
export type StrokeStyle = "solid" | "dashed" | "dotted" | [number, number];

export const getStrokeDashArray = (
  style: StrokeStyle,
  strokeWidth: number
): NumberUnit[] => {
  if (style === "dashed") {
    return [strokeWidth * 2, strokeWidth * 4];
  }
  if (style === "dotted") {
    return [0, strokeWidth * 2];
  }
  if (Array.isArray(style)) {
    return style;
  }
  return [];
};
