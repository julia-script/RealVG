import React from "react";
import { useGraph } from "./graph-provider";
import { useTheme } from "./theme-provider";
import { Rect } from "./rect";

export const Background = () => {
  const { width, height } = useGraph();

  const { theme } = useTheme();

  return (
    <Rect
      size={[`${width}vs`, `${height}vs`]}
      position={["0vs", "0vs"]}
      fillColor={theme.colors.background}
    />
  );
};
