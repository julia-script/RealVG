import React from "react";
import { Background } from "./Background";
import { ThemeProvider, GraphProvider } from "./providers";
import { Grid } from "./grid";

type GraphProps = {
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  coordBox?: [number, number, number, number];
  displayBackgrond?: boolean;
  displayGrid?: boolean;
} & React.PropsWithChildren<{}>;

export const Graph = ({
  width = 300,
  height = 200,
  coordBox = [-5, 5, 5, -5],
  children,
  displayBackgrond = true,
  displayGrid = true,
}: GraphProps) => {
  return (
    <svg viewBox={`0 0 ${width} ${height}`}>
      <GraphProvider width={width} height={height} coordBox={coordBox}>
        <ThemeProvider>
          {displayBackgrond && <Background />}
          {displayGrid && <Grid />}
          {children}
        </ThemeProvider>
      </GraphProvider>
    </svg>
  );
};
