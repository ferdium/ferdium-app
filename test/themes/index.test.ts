import makeDefaultThemeConfig from '../../src/themes/default';
import makeDarkThemeConfig from '../../src/themes/dark';
import { theme, ThemeType } from '../../src/themes';

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
