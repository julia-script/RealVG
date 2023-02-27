import React from "react";
import { useGraph } from "./providers";
import { Rect } from "./elements";

export const Background = () => {
  const { width, height, theme } = useGraph();
  return (
    <Rect
      pos={["0vs", "0vs"]}
      size={[`${width}vs`, `${height}vs`]}
      fill={theme.background}
      strokeWidth={0}
    />
  );
};
