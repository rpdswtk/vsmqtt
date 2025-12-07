interface ThemeInformation {
  themeKind: ColorThemeKind
}

export enum ColorThemeKind {
  Light = 1,
  Dark = 2,
  HighContrast = 3,
  HighContrastLight = 4,
}

export type { ThemeInformation }
