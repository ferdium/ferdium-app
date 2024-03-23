import { type ThemeType, theme } from '../../src/themes';
import makeDarkThemeConfig from '../../src/themes/dark';
import makeDefaultThemeConfig from '../../src/themes/default';

describe('Load theme', () => {
  it('loads default theme', () => {
    const { colorBackground } = theme('default' as ThemeType);
    expect(colorBackground).toBe(
      makeDefaultThemeConfig('default').colorBackground,
    );
  });

  it('loads dark theme', () => {
    const { colorBackground } = theme('dark' as ThemeType);
    expect(colorBackground).toBe(makeDarkThemeConfig('dark').colorBackground);
  });
});
