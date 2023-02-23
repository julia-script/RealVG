import { inverseLerp } from "math";
import React, { createContext } from "react";
import { Background } from "./Background";
import { BBox } from "./bbox";
import { GraphProvider } from "./graph-provider";
import { Rect } from "./Rect";
import { ThemeProvider } from "./theme-provider";

type GraphProps = {
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  coordBox?: [number, number, number, number];
} & React.PropsWithChildren<{}>;

export const Graph = ({
  width = 300,
  height = 200,
  coordBox = [-5, 5, 5, -5],
  children,
}: GraphProps) => {
  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <GraphProvider width={width} height={height} coordBox={coordBox}>
        <ThemeProvider>
          <Background />
          {children}
        </ThemeProvider>
      </GraphProvider>
    </svg>
  );
};
