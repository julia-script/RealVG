import { Graph } from "../graph/Graph";
import { cubic, inverseLerp, lerp, Point, Points2, Points3 } from "math";
import { quadratic } from "math";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Line, Mark, Parametric, PolyLine, Rect } from "../graph/elements";
import { BBoxRect } from "../graph/elements/BBoxRect";
import {
  BBox,
  normalizeBBox,
  NormalizedBBox,
  WithPointerEvents,
} from "../graph/utils";
import { GraphContextProps } from "../graph/providers";
import { solveCubic, solveCubic2 } from "math/src/cubic";
import { Label } from "../graph/elements/Label";
import { getCos } from "math/src/quadratic";

const useCoordControl = (
  initial: Point
): WithPointerEvents & { pos: Point } => {
  const [dragging, setDragging] = useState(false);
  const [point, setPoint] = useState(initial);
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as SVGGElement).setPointerCapture(e.pointerId);
      setDragging(true);
    },
    [setDragging]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent, graph: GraphContextProps) => {
      if (!dragging) return;
      const [offsetX, offsetY] = graph.computeSizeToCoordSpace([
        e.movementX,
        e.movementY,
      ]);
      setPoint(([x, y]) => [x + offsetX, y + offsetY]);
    },
    [dragging, setPoint]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    (e.target as SVGGElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  }, []);

  return {
    pos: point,
    interactable: true,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};

class Matrix extends DOMMatrix {
  fromDOMMatrix(matrix: DOMMatrix) {
    return new Matrix(...matrix.toFloat64Array());
  }
  apply([x, y]: Point): Point {
    const point = new DOMPoint(x, y);
    const transformed = point.matrixTransform(this);
    return [transformed.x, transformed.y];
  }
  translate(point: Point): Matrix {
    const [x, y] = point;
    return this.fromDOMMatrix(this.translateSelf(x, y));
  }
}
const useNavigator = (coordBox: BBox = { x: [0, 10], y: [10, 0] }) => {
  const bbox = useMemo(() => normalizeBBox(coordBox), [coordBox]);
  const [transform, setTransform] = useState(new DOMMatrix());
  const [dragging, setDragging] = useState(false);

  const outCoordBox = useMemo(() => {
    const x = new DOMPoint(bbox.x[0], bbox.y[0]).matrixTransform(transform);
    const y = new DOMPoint(bbox.x[1], bbox.y[1]).matrixTransform(transform);

    return {
      x: [x.x, y.x],
      y: [x.y, y.y],
    } as NormalizedBBox;
  }, [transform, ...bbox.x, ...bbox.y]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as SVGSVGElement).setPointerCapture(e.pointerId);
      setDragging(true);
    },
    [setDragging]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent, graph: GraphContextProps) => {
      if (!dragging) return;
      const [offsetX, offsetY] = graph.computeSizeToCoordSpace([
        e.movementX,
        e.movementY,
      ]);
      setTransform((prev) => {
        return prev.translate(-offsetX, -offsetY);
      });
    },
    [dragging, setTransform]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as SVGSVGElement).releasePointerCapture(e.pointerId);
      setDragging(false);
    },
    [setDragging]
  );

  return {
    coordBox: outCoordBox,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};

export const CubicDerivatives = () => {
  // const p0 = useCoordControl([2, 2]);
  // const p1 = useCoordControl([5, 7]);
  // const p2 = useCoordControl([8, 2]);
  // const p3 = useCoordControl([5, 2]);
  const p0 = useCoordControl([1, 2]);
  const p1 = useCoordControl([3, 7]);
  const p2 = useCoordControl([7, 7]);
  const p3 = useCoordControl([9, 2]);
  const [t, setT] = useState(0.5);
  const v0 = useMemo<Point>(() => {
    return [lerp(p0.pos[0], p1.pos[0], t), lerp(p0.pos[1], p1.pos[1], t)];
  }, [p0.pos, p1.pos, t]);

  const v1 = useMemo<Point>(() => {
    return [lerp(p1.pos[0], p2.pos[0], t), lerp(p1.pos[1], p2.pos[1], t)];
  }, [p1.pos, p2.pos, t]);

  const v2 = useMemo<Point>(() => {
    return [lerp(p2.pos[0], p3.pos[0], t), lerp(p2.pos[1], p3.pos[1], t)];
  }, [p2.pos, p3.pos, t]);

  const v0v1 = useMemo<Point>(() => {
    return [lerp(v0[0], v1[0], t), lerp(v0[1], v1[1], t)];
  }, [v0, v1]);

  const v1v2 = useMemo<Point>(() => {
    return [lerp(v1[0], v2[0], t), lerp(v1[1], v2[1], t)];
  }, [v1, v2]);

  const v0v1v2 = useMemo<Point>(() => {
    return [lerp(v0v1[0], v1v2[0], t), lerp(v0v1[1], v1v2[1], t)];
  }, [v0v1, v1v2]);

  const navigator = useNavigator({
    x: [0, 10],
    y: [10, 0],
  });

  const quadCurve = useMemo(
    () => quadratic.QuadCurve.of(p0.pos, p1.pos, p2.pos),
    [p0.pos, p1.pos, p2.pos]
  );

  const cubicCurve = useMemo(
    () => cubic.CubicCurve.of(p0.pos, p1.pos, p2.pos, p3.pos),
    [p0.pos, p1.pos, p2.pos, p3.pos]
  );
  const [left, right] = quadCurve.split();
  const extremas = quadCurve.extremaPoints();

  const bbox = cubicCurve.bbox();
  const a = 8;
  const b = 1;
  const c = -2;
  const d = -0.5;
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
        t: {t}
      </p>
      <Graph width={"100%"} height={"400px"} padding={[10, 10]} {...navigator}>
        <PolyLine
          color={0}
          width={2}
          strokeStyle={"dashed"}
          points={[...p0.pos, ...p1.pos, ...p2.pos, ...p3.pos]}
        />

        <Parametric tLimits={[0, 10]} xy={getCos} />

        {/* <Parametric
          tLimits={[0, 1]}
          xy={(t) => {
            return left.at(t);
          }}
          color={3}
          width={15}
        />
        <Parametric
          tLimits={[0, 1]}
          xy={(t) => {
            return right.at(t);
          }}
          color={4}
          width={15}
        /> */}
        <Parametric
          tLimits={[0, t]}
          xy={useCallback(
            (t) => {
              return cubicCurve.at(t);
            },
            [cubicCurve]
          )}
          color={3}
          width={6}
        />
        {/* <BBoxRect bbox={bbox} color={0} strokeStyle={"dotted"} /> */}
        {/* <Parametric
          tLimits={[0, 1]}
          xy={(t) => {
            return cubicCurve.at(t);
          }}
        /> */}

        <Mark {...p0} />
        <Mark {...p1} />
        <Mark {...p2} />
        <Mark {...p3} />
        {/* {cubicCurve.extremas().map((t, i) => {
          return (
            <Mark key={i} pos={cubicCurve.at(t)} component="🔥" color={0} />
          );
        })} */}
        <Line start={v0} end={v1} color={0} width={1} strokeStyle={"dotted"} />
        <Line start={v1} end={v2} color={0} width={1} strokeStyle={"dotted"} />
        <Line
          start={v0v1}
          end={v1v2}
          color={0}
          width={1}
          strokeStyle={"dotted"}
        />

        <Mark pos={v0} color={0} size={8} />
        <Mark pos={v1} color={0} size={8} />
        <Mark pos={v2} color={0} size={8} />
        <Mark pos={v0v1} color={0} size={8} />
        <Mark pos={v1v2} color={0} size={8} />

        <Label
          pos={v0v1v2}
          fontWeight="bold"
          content={`(${v0v1v2[0].toFixed(2)}, ${v0v1v2[1].toFixed(2)})
          \\frac{1}{2}`}
          maxWidth={200}
          direction={"n"}
          distance={80}
        />
        <Mark pos={v0v1v2} component="🌝" color={0} />

        {/* <Mark pos={quadCurve.at(quadCurve.extremas()[0])} />
        <Mark pos={quadCurve.at(quadCurve.extremas()[1])} /> */}

        {/* <Mark pos={radiansOnUnitSquare(Math.PI * 2 * t)} /> */}
      </Graph>

      <div style={{ display: "flex", flexDirection: "row", gap: 6 }}>
        <Graph
          coordBox={{
            x: [0, 1],
            y: [10, 0],
          }}
          padding={[20, 20]}
          coordStep={[0.1, 1]}
        >
          <BBoxRect
            bbox={{
              x: [0, 1],
              y: [10, 0],
            }}
          />
          <Parametric
            tLimits={[0, 10]}
            xy={(t) => {
              return [t, Math.cos(t)];
            }}
          />

          <Parametric
            tLimits={[0, 1]}
            xy={(t) => {
              // const [x, _] = cubicCurve.at(t);
              // Ax^3 + Bx^2 + Cx + D = 0

              const x = t;
              const y = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
              return [t, y];
            }}
            color={4}
          />

          {solveCubic2(a, b, c, d).map((t, i) => {
            return <Mark key={i} pos={[t, 0]} />;
          })}
          {/* <Mark pos={[quadCurve.extremas()[0], 0]} /> */}
        </Graph>
        <Graph
          coordBox={{
            x: [0, 1],
            y: [10, 0],
          }}
          padding={[10, 10]}
          coordStep={[0.1, 1]}
        >
          <BBoxRect
            bbox={{
              x: [0, 1],
              y: [10, 0],
            }}
          />
          <Parametric
            tLimits={[0, 1]}
            xy={(t) => {
              const [_, y] = cubicCurve.at(t);
              return [t, y];
            }}
            color={4}
          />
          {cubicCurve.roots()[1].map((t, i) => {
            return <Mark key={i} pos={[t, 0]} />;
          })}

          {/* <Mark pos={[quadCurve.extremas()[1], 0]} /> */}
        </Graph>
      </div>
    </>
  );
};
