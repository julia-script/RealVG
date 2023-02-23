import { isString } from "lodash";
import { CubicSequence, evalT } from "math";
import React, { useState } from "react";
import { Graph } from "../graph/Graph";

import {
  BezierCurve,
  PolyLine,
  Line,
  Mark,
  MarkTrail,
} from "../graph/elements";

export const CubicDerivatives = () => {
  const [t, setT] = useState(0.5);
  const curve: CubicSequence = [0, 0, 1, 2, 2, -2, 3, 0];
  const curve2 = curve.map((x) => x * -1) as CubicSequence;
  const curve3 = curve.map((x) => x - 4) as CubicSequence;

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
        <PolyLine points={curve} opacity={0.2} weight="light" />
        <BezierCurve points={curve} weight="tertiary" shade={0} />
        <BezierCurve points={curve2} weight="secondary" />
        <BezierCurve points={curve3} weight="primary" />
        <MarkTrail points={curve} displayLabel={false} weight="regular" />

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
