import makeDarkThemeConfig from './dark';
import makeDefaultThemeConfig from './default';
import { themeBrandPrimary } from './legacy';

export enum ThemeType {
  default = 'default',
  dark = 'dark',
}

export const theme = (
  themeId: ThemeType,
  brandColor: string = themeBrandPrimary,
) => {
  return themeId === ThemeType.dark
    ? makeDarkThemeConfig(brandColor)
    : makeDefaultThemeConfig(brandColor);
};

const defaultThemeConfigWithDefaultAccentColor =
  makeDefaultThemeConfig(themeBrandPrimary);

export type Theme = typeof defaultThemeConfigWithDefaultAccentColor;
