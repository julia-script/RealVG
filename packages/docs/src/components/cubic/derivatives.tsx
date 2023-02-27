import { Graph } from "../graph/Graph";
import { cubic, inverseLerp, Point, Points2, Points3 } from "math";
import { quadratic } from "math";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Mark, Parametric, PolyLine, Rect } from "../graph/elements";
import { BBoxRect } from "../graph/elements/BBoxRect";
import { BBox, WithPointerEvents } from "../graph/utils";
import { GraphContextProps } from "../graph/providers";

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
  const [transform, setTransform] = useState(new DOMMatrix());
  const [dragging, setDragging] = useState(false);

  const x = useMemo(() => {
    return new DOMPoint(coordBox.x[0], coordBox.y[0]).matrixTransform(
      transform
    );
  }, [transform, ...coordBox.x, ...coordBox.y]);
  const y = useMemo(() => {
    return new DOMPoint(coordBox.x[1], coordBox.y[1]).matrixTransform(
      transform
    );
  }, [transform, ...coordBox.x, ...coordBox.y]);

  const outCoordBox = useMemo(() => {
    const x = new DOMPoint(coordBox.x[0], coordBox.y[0]).matrixTransform(
      transform
    );
    const y = new DOMPoint(coordBox.x[1], coordBox.y[1]).matrixTransform(
      transform
    );

    return {
      x: [x.x, y.x],
      y: [x.y, y.y],
    } as BBox;
  }, [transform, ...coordBox.x, ...coordBox.y]);

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
  const p0 = useCoordControl([2, 2]);
  const p1 = useCoordControl([5, 7]);
  const p2 = useCoordControl([8, 2]);
  const p3 = useCoordControl([5, 2]);

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

  return (
    <>
      <Graph width={"100%"} height={"400px"} padding={[10, 10]} {...navigator}>
        <PolyLine
          color={0}
          width={2}
          strokeStyle={"dashed"}
          points={[...p1.pos, ...p0.pos]}
        />
        <PolyLine
          color={0}
          width={2}
          strokeStyle={"dashed"}
          points={[...p1.pos, ...p2.pos]}
        />
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
          tLimits={[0, 1]}
          xy={useCallback(
            (t) => {
              return quadCurve.at(t);
            },
            [quadCurve]
          )}
          color={1}
          width={6}
        />

        {/* <Parametric
          tLimits={[0, 1]}
          xy={(t) => {
            return cubicCurve.at(t);
          }}
        /> */}

        <Mark {...p0} />
        <Mark {...p1} color={0} component={"🤡"} />
        <Mark {...p2} />
        {/* <Mark {...p3} /> */}

        {/* <Mark pos={quadCurve.at(quadCurve.extremas()[0])} />
        <Mark pos={quadCurve.at(quadCurve.extremas()[1])} /> */}
      </Graph>

      <div style={{ display: "flex", flexDirection: "row", gap: 6 }}>
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
              const [x, _] = quadCurve.at(t);
              return [t, x];
            }}
            color={4}
          />

          {quadCurve.roots()[0].map((t, i) => {
            return <Mark key={i} pos={[t, 0]} size={1} />;
          })}
          <Mark pos={[quadCurve.extremas()[0], 0]} />
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
              const [_, y] = quadCurve.at(t);
              return [t, y];
            }}
            color={4}
          />
          {quadCurve.roots()[1].map((t, i) => {
            return <Mark key={i} pos={[t, 0]} size={1} />;
          })}
          <Mark pos={[quadCurve.extremas()[1], 0]} />
        </Graph>
      </div>
    </>
  );
};
