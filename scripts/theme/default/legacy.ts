/* legacy config, injected into sass at build time */
interface ILegacyConfig {
  [key: string]: string;
}

const legacyConfig: ILegacyConfig = {
  themeBrandPrimary: '#7266F0',
  themeBrandSuccess: '#5cb85c',
  themeBrandInfo: '#5bc0de',
  themeBrandWarning: '#FF9F00',
  themeBrandDanger: '#d9534f',

  themeGrayDark: '#373a3c',
  themeGray: '#55595c',
  themeGrayLight: '#818a91',
  themeGrayLighter: '#eceeef',
  themeGrayLightest: '#f7f7f9',

  themeBorderRadius: '6px',
  themeBorderRadiusSmall: '3px',

  themeSidebarWidth: '68px',

  themeTextColor: '#373a3c',

  themeTransitionTime: '.5s',

  themeInsetShadow: 'inset 0 2px 5px rgba(0, 0, 0, .03)',

  darkThemeBlack: '#1A1A1A',

  darkThemeGrayDarkest: '#1E1E1E',
  darkThemeGrayDarker: '#2D2F31',
  darkThemeGrayDark: '#383A3B',

  darkThemeGray: '#47494B',

  darkThemeGrayLight: '#515355',
  darkThemeGrayLighter: '#8a8b8b',
  darkThemeGrayLightest: '#FFFFFF',

  darkThemeGraySmoke: '#CED0D1',
  darkThemeTextColor: '#FFFFFF',
};

export default legacyConfig;
