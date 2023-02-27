import { Point } from "math";
import React, { useMemo } from "react";
import { GraphNodeProps } from "../../utils";
import { PolyLine } from "../Polyline";

type ParametricProps = {
  tLimits: [number, number];
  xy: (t: number) => [number, number];
} & GraphNodeProps;

export const Parametric = ({ tLimits, xy, ...rest }: ParametricProps) => {
  const points = useMemo(() => {
    const [tMin, tMax] = tLimits;
    const points: number[] = [];
    for (let t = tMin; t <= tMax; t += 0.01) {
      points.push(...xy(t));
    }
    return points;
  }, [tLimits, xy]);
  return <PolyLine points={points} {...rest} />;
};
