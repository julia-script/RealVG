import { createContext, useCallback, useContext, useMemo } from "react";
import { useGraph } from "./GraphProvider";
import React from "react";
import { NumberUnit } from "../utils";
import { isNumber } from "lodash";

type ThemeShades = 0 | 1 | 2 | 3;
export type ThemeColor = [
  "primary" | "secondary" | "tertiary" | "body" | "background",
  ThemeShades
];

export interface ThemeWeightDefinitions {
  strokeColor: ThemeColor;
  strokeWidth: NumberUnit;
  fillColor: ThemeColor;
  strokeDashArray: number[];
  opacity: number;
  fontFamily: string;
  fontSize: NumberUnit;
  fontWeight: number | string;
}
export interface ComputedThemeWeightDefinitions {
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
  strokeDashArray: number[];
  opacity: number;
  fontFamily: string;
  fontSize: NumberUnit;
  fontWeight: number | string;
}
export type ThemeWeights =
  | "primary"
  | "secondary"
  | "tertiary"
  | "regular"
  | "light"
  | "extraLight"
  | "strong";

export interface Theme {
  colors: {
    primary: [string, string, string, string]; // 4 shades per theme color
    secondary: [string, string, string, string];
    tertiary: [string, string, string, string];
    body: [string, string, string, string];
    background: [string, string, string, string];
  };

  weights: {
    [key in ThemeWeights]: ThemeWeightDefinitions;
  };
}

const DEFAULT_WEIGHTS: ThemeWeightDefinitions = {
  strokeColor: ["primary", 0],
  strokeWidth: 1,
  fillColor: ["primary", 0],
  strokeDashArray: [],
  opacity: 1,
  fontFamily: "monospace",
  fontSize: 10,
  fontWeight: 400,
};

export const DEFAULT_THEMES: { dark: Theme; light: Theme } = {
  dark: {
    colors: {
      primary: ["#F5697E", "#E96479", "#CF596A", "#A84857"],
      secondary: ["#FF9800", "#E68A00", "#C47600", "#B56D00"],
      tertiary: ["#87C7C4", "#7DB9B6", "#6DA19E", "#618F8D"],
      body: ["#75736F", "#96948F", "#B3B0AA", "#F5F1E9"],
      background: ["#1c1e21", "#2c2f33", "#3c4045", "#4c5055"],
    },
    weights: {
      primary: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["primary", 0],
        fillColor: ["primary", 0],
        strokeWidth: 2,
      },
      secondary: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["secondary", 0],
        fillColor: ["secondary", 0],
        strokeWidth: 2,
      },
      tertiary: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["tertiary", 0],
        fillColor: ["tertiary", 0],
        strokeWidth: 2,
      },
      regular: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["body", 1],
        fillColor: ["body", 1],
        strokeWidth: 1,
      },
      light: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["body", 2],
        fillColor: ["body", 2],
        strokeWidth: 1,
      },
      extraLight: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["body", 2],
        fillColor: ["body", 2],
        strokeDashArray: [1, 1],
        strokeWidth: 0.2,
      },
      strong: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["body", 0],
        fillColor: ["body", 0],
        strokeWidth: 2,
      },
    },
  },
  light: {
    colors: {
      primary: ["#F5697E", "#E96479", "#CF596A", "#A84857"],
      secondary: ["#FF9800", "#E68A00", "#C47600", "#B56D00"],
      tertiary: ["#87C7C4", "#7DB9B6", "#6DA19E", "#618F8D"],
      body: ["#96948F", "#DBD8D0", "#F5F1E9", "#FFFBF2"],
      background: ["#FFFBF2", "#F5F1E9", "#DBD8D0", "#96948F"],
    },
    weights: {
      primary: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["primary", 0],
        fillColor: ["primary", 0],
        strokeWidth: 2,
      },
      secondary: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["secondary", 0],
        fillColor: ["secondary", 0],
        strokeWidth: 2,
      },
      tertiary: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["tertiary", 0],
        fillColor: ["tertiary", 0],
        strokeWidth: 2,
      },
      regular: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["body", 1],
        fillColor: ["body", 1],
        strokeWidth: 1,
      },
      light: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["body", 0],
        fillColor: ["body", 0],
        strokeWidth: 1,
      },
      extraLight: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["body", 1],
        fillColor: ["body", 1],
        strokeDashArray: [1, 1],
        strokeWidth: 0.4,
      },
      strong: {
        ...DEFAULT_WEIGHTS,
        strokeColor: ["body", 0],
        fillColor: ["body", 0],
        strokeWidth: 2,
      },
    },
  },
};

type ThemeContextProps = {
  themes: { [key: string]: Theme };
  theme: Theme;
  variant: string;
};
const ThemeContext = createContext<ThemeContextProps>({} as ThemeContextProps);

type ThemeProviderProps = {
  variant?: string;
  themes?: { [key: string]: Theme };
} & React.PropsWithChildren<{}>;

export const ThemeProvider = ({
  variant = "dark",
  themes = {},
  children,
}: ThemeProviderProps) => {
  const theme = useMemo<Theme>(() => {
    const theme = { ...DEFAULT_THEMES[variant], ...themes[variant] };
    return theme;
  }, [variant, themes]);

  return (
    <ThemeContext.Provider
      value={{
        themes,
        theme,
        variant,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (
  themeWeight: ThemeWeights = "regular",
  overwrites: Partial<ComputedThemeWeightDefinitions> = {},
  shade?: ThemeShades
) => {
  const themeContext = useContext(ThemeContext);

  const { theme } = themeContext;
  const { computeNumber } = useGraph();

  const getColor = useCallback(
    (themeColor: ThemeColor, shade?: ThemeShades) => {
      const [color, themeShade] = themeColor;
      return theme.colors[color][isNumber(shade) ? shade : themeShade];
    },
    [theme]
  );
  const getComputedStyles = useCallback(
    (weight: ThemeWeights, shade?: ThemeShades) => {
      const {
        fillColor,
        strokeColor,
        strokeWidth,
        strokeDashArray,
        fontFamily,
        fontSize,
        fontWeight,
        opacity,
      } = theme.weights[weight];
      return {
        strokeColor: getColor(strokeColor, shade),
        fillColor: getColor(fillColor, shade),
        strokeWidth: Math.abs(computeNumber(strokeWidth, "vs")),
        strokeDashArray: strokeDashArray.map((value) =>
          computeNumber(value, "vs")
        ),
        fontFamily,
        fontSize: Math.abs(computeNumber(fontSize, "vs")),
        fontWeight,
        opacity,
      };
    },
    [theme, getColor, computeNumber]
  );
  return useMemo(
    () => ({
      ...getComputedStyles(themeWeight, shade),
      ...themeContext,
      ...overwrites,
    }),
    [themeContext, themeWeight, ...Object.values(overwrites)]
  );
};
