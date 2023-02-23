import { isString } from "lodash";
import { evalT } from "math";
import React, { useState } from "react";
import { Graph } from "../graph/Graph";
import { BezierCurve } from "../graph/cubic-curve";
import { Grid } from "../graph/grid";
import { Line } from "../graph/line";
import { Mark } from "../graph/Mark";
import { PointTrail } from "../graph/MarkTrail";
import { PolyLine } from "../graph/polyline";

export const CubicDerivatives = () => {
  const [t, setT] = useState(0.5);
  const curve: CubicSequence = [0, 0, 1, 2, 2, -2, 3, 0];
  const curve2: CubicSequence = curve.map((x) => x * -1);
  const curve3: CubicSequence = curve.map((x) => x - 4);

  return (
    <>
      <p>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={t}
          onChange={(e) => setT(parseFloat(e.target.value))}
        />
      </p>

      <Graph>
        <Grid />

        <PolyLine points={curve} opacity={0.2} weight="light" />

        <BezierCurve points={curve} weight="tertiary" shade={0} />
        <BezierCurve points={curve2} weight="secondary" />
        <BezierCurve points={curve3} weight="primary" />
        <PointTrail points={curve} displayLabel={false} weight="regular" />

        <Mark pos={evalT(curve, t)} weight="primary" />
        <Line start={[0, 0]} end={[-1, 1]} arrow />
        {/* {Object.values(DEFAULT_THEMES.light.colors).map((colors, y) =>
          (isString(colors) ? [colors] : colors).map((color, x) => (
            <Rect
              key={`${x}-${y}`}
              position={[x, -y]}
              size={[1, 1]}
              strokeColor={color}
              fillColor={color}
            />
          ))
        )} */}
      </Graph>
    </>
  );
};
