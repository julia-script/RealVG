import React from "react";
import { useGraph, useTheme } from "./providers";
import { Rect } from "./elements";

export const Background = () => {
  const { width, height } = useGraph();
  const { theme } = useTheme();
  // return null;
  return (
    <Rect
      position={["0vs", "0vs"]}
      size={[`${width}vs`, `${height}vs`]}
      fillColor={theme.colors.background[0]}
    />
  );
};
