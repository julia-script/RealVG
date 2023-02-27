import React, { useEffect, useLayoutEffect, useState } from "react";
import { Background } from "./Background";
import { GraphProvider, useGraph, GraphContextProps } from "./providers";
import { Grid } from "./elements";
import { debounce, defer, isNumber } from "lodash";
import { darkTheme, Theme } from "./utils/styles";
import { Point } from "math";
import { WithPointerEvents } from "./utils";

type GraphProps = {
  coordBox?: {
    x: Point;
    y: Point;
  };
  padding?: Point;
  /**
   * Coord step defines the unit size in coords space
   */
  coordStep?: Point | number;
  displayBackgrond?: boolean;
  displayGrid?: boolean;

  theme?: Theme;
} & WithPointerEvents &
  Omit<
    React.SVGProps<SVGSVGElement>,
    "onPointerMove" | "onPointerDown" | "onPointerUp"
  >;

type PointerEvents = {
  onPointerMove?: (
    e: React.PointerEvent<SVGRectElement>,
    graph: GraphContextProps
  ) => void;
  onPointerDown?: (
    e: React.PointerEvent<SVGRectElement>,
    graph: GraphContextProps
  ) => void;
  onPointerUp?: (
    e: React.PointerEvent<SVGRectElement>,
    graph: GraphContextProps
  ) => void;
};

const EventNet = ({
  onPointerMove,
  onPointerDown,
  onPointerUp,
}: PointerEvents) => {
  const graph = useGraph();
  const { width, height } = graph;
  return (
    <rect
      fill="transparent"
      width={width}
      height={height}
      onPointerDown={(e) => {
        onPointerDown?.(e, graph);
      }}
      onPointerMove={(e) => {
        onPointerMove?.(e, graph);
      }}
      onPointerUp={(e) => {
        onPointerUp?.(e, graph);
      }}
    />
  );
};
export const Graph = ({
  coordBox = {
    x: [-10, 10],
    y: [10, -10],
  },
  coordStep = [1, 1],
  padding = [0, 0],
  children,
  displayBackgrond = true,
  displayGrid = true,
  theme = darkTheme,

  onPointerDown,
  onPointerMove,
  onPointerUp,
  ...rest
}: GraphProps) => {
  const graphRef = React.useRef<SVGSVGElement>(null);

  const [[width, height], setDimensions] = useState([
    graphRef.current?.clientWidth ?? 300,
    graphRef.current?.clientHeight ?? 300,
  ]);

  useLayoutEffect(() => {
    if (!graphRef.current) {
      return;
    }
    const set = debounce(
      (width, height) => setDimensions([width, height]),
      100
    );

    const observer = new ResizeObserver(() => {
      const width = graphRef.current?.clientWidth || 0;
      const height = graphRef.current?.clientHeight || 0;
      set(width, height);
    });
    observer.observe(graphRef.current);
    return () => {
      observer.disconnect();
    };
  }, [graphRef.current]);
  return (
    <svg ref={graphRef} viewBox={`0 0 ${width} ${height}`} {...rest}>
      <GraphProvider
        width={width}
        height={height}
        coordBox={coordBox}
        padding={padding}
        coordStep={isNumber(coordStep) ? [coordStep, coordStep] : coordStep}
        graphRef={graphRef}
        theme={theme}
      >
        {displayBackgrond && <Background />}
        {displayGrid && <Grid />}
        <EventNet
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />

        {children}
      </GraphProvider>
    </svg>
  );
};
