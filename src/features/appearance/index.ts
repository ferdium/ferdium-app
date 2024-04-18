import color from 'color';
import { reaction } from 'mobx';
import TopBarProgress from 'react-topbar-progress-indicator';

import { pathExistsSync, readFileSync } from 'fs-extra';
import {
  DEFAULT_APP_SETTINGS,
  SIDEBAR_SERVICES_LOCATION_BOTTOMRIGHT,
  SIDEBAR_SERVICES_LOCATION_CENTER,
  SIDEBAR_SERVICES_LOCATION_TOPLEFT,
  iconSizeBias,
} from '../../config';
import { isLinux, isWindows } from '../../environment';
import { userDataPath } from '../../environment-remote';

const STYLE_ELEMENT_ID = 'custom-appearance-style';

function createStyleElement() {
  const styles = document.createElement('style');
  styles.id = STYLE_ELEMENT_ID;

  document.querySelector('head')?.append(styles);
}

function setAppearance(style) {
  const styleElement = document.querySelector(`#${STYLE_ELEMENT_ID}`);

  if (styleElement) {
    styleElement.innerHTML = style;
  }
}

// See https://github.com/Qix-/color/issues/53#issuecomment-656590710
function darkenAbsolute(originalColor, absoluteChange) {
  const originalLightness = originalColor.lightness();
  return originalColor.lightness(originalLightness - absoluteChange);
}

function generateUserCustomCSS() {
  const path = userDataPath('config', 'custom.css');
  return pathExistsSync(path) ? readFileSync(path).toString() : '';
}

function generateAccentStyle(accentColorStr) {
  let accentColor;
  try {
    accentColor = color(accentColorStr);
  } catch {
    // eslint-disable-next-line no-param-reassign
    accentColorStr = DEFAULT_APP_SETTINGS.accentColor;
    accentColor = color(accentColorStr);
  }
  const darkerColorStr = darkenAbsolute(accentColor, 5).hex();
  return `
    .theme__dark .app .sidebar .sidebar__button.is-muted,
    .theme__dark .app .sidebar .sidebar__button.is-active,
    .sidebar .sidebar__button.is-muted,
    .sidebar .sidebar__button.is-active,
    .settings .account .invoices .invoices__action button,
    .settings-navigation .settings-navigation__link.is-active .badge,
    a.link,
    button.link,
    .auth .welcome .button:hover,
    .auth .welcome .button__inverted,
    .franz-form .franz-form__radio.is-selected,
    .theme__dark .franz-form__button.franz-form__button--inverted,
    .franz-form__button.franz-form__button--inverted {
      color: ${accentColorStr};
    }

    .settings .settings__header,
    .settings .settings__close,
    .settings-navigation .settings-navigation__link.is-active,
    a.button,
    button.button,
    .info-bar,
    .info-bar.info-bar--primary,
    .infobox.infobox--primary,
    .theme__dark .badge.badge--primary,
    .badge.badge--primary,
    .content-tabs .content-tabs__tabs .content-tabs__item.is-active,
    #electron-app-title-bar .toolbar-dropdown:not(.open) > .toolbar-button > button:hover,
    #electron-app-title-bar .list-item.selected .menu-item,
    #electron-app-title-bar .list-item.selected:focus .menu-item,
    .theme__dark .quick-switch .active,
    .franz-form .franz-form__toggle-wrapper .franz-form__toggle.is-active .franz-form__toggle-button,
    .theme__dark .franz-form__button,
    .franz-form__button,
    .ferdium__fab,
    .franz-form .franz-form__slider-wrapper .slider::-webkit-slider-thumb,
    span.loader div > div > div {
      background: ${accentColorStr};
    }

    .settings .settings__header .separator {
      border-right-color: ${accentColorStr};
    }

    .franz-form .franz-form__radio.is-selected, .tab-item.is-active {
      border-color: ${accentColorStr};
    }

    a.button:hover, button.button:hover {
      background: ${darkenAbsolute(accentColor, 10).hex()};
    }

    .franz-form__button:hover,
    .franz-form__button.franz-form__button--inverted:hover,
    .settings .settings__close:hover,
    .theme__dark .franz-form__button:hover,
    .theme__dark .franz-form__button.franz-form__button--inverted:hover,
    .theme__dark .settings .settings__close:hover {
      background: ${darkerColorStr};
    }

    .franz-form__button:active,
    .theme__dark .franz-form__button:active {
      background: ${darkerColorStr};
    }

    .settings__close {
      border-color: ${darkerColorStr}!important;
    }

    .theme__dark .franz-form__button.franz-form__button--inverted,
    .franz-form__button.franz-form__button--inverted {
      background: none;
      border-color: ${accentColorStr};
    }

    .tab-item.is-active {
      background: ${accentColor.lightness(90).hex()};
    }
  `;
}

function generateServiceRibbonWidthStyle(
  widthStr,
  iconSizeStr,
  horizontal,
  isLabelEnabled,
  sidebarServicesLocation,
  useGrayscaleServices,
  grayscaleServicesDim,
  shouldShowDragArea,
  isFullScreen,
) {
  const width = Number(widthStr);
  const iconSize = Number(iconSizeStr) - iconSizeBias;
  const tabItemWidthBias = 3;
  const verticalStyleOffset = 29;

  let fontSize: number;
  let tabItemHeightBias: number;
  let sidebarSizeBias: number;

  switch (width) {
    case 35: {
      fontSize = 9;
      tabItemHeightBias = 25;
      sidebarSizeBias = 48;
      break;
    }
    case 45: {
      fontSize = 10;
      tabItemHeightBias = 21;
      sidebarSizeBias = 44;
      break;
    }
    case 80: {
      fontSize = 11;
      tabItemHeightBias = 3;
      sidebarSizeBias = 27;
      break;
    }
    case 90: {
      fontSize = 12;
      tabItemHeightBias = 0;
      sidebarSizeBias = 25;
      break;
    }
    case 100: {
      fontSize = 13;
      tabItemHeightBias = 2;
      sidebarSizeBias = 25;
      break;
    }
    default: {
      fontSize = 11;
      tabItemHeightBias = 13;
      sidebarSizeBias = 37;
    }
  }

  if (!isLabelEnabled) {
    sidebarSizeBias = 22;
    tabItemHeightBias = -5;
  }

  if (isWindows || isLinux) {
    sidebarSizeBias = 0;
  }

  // Due to the lowest values for SIDEBAR_WIDTH and ICON_SIZES, this can be computed to a negative value
  const minimumAdjustedIconSize = Math.max(width / 2 + iconSize, 2);

  let sidebarServicesAlignment;
  switch (sidebarServicesLocation) {
    case SIDEBAR_SERVICES_LOCATION_TOPLEFT: {
      sidebarServicesAlignment = horizontal ? 'left' : 'start';
      break;
    }
    case SIDEBAR_SERVICES_LOCATION_CENTER: {
      sidebarServicesAlignment = horizontal ? 'center' : 'center';
      break;
    }
    case SIDEBAR_SERVICES_LOCATION_BOTTOMRIGHT: {
      sidebarServicesAlignment = horizontal ? 'right' : 'end';
      break;
    }
    default: {
      sidebarServicesAlignment = horizontal ? 'left' : 'start';
      break;
    }
  }

  const graysacleServices = `filter: grayscale(1);
  opacity: ${grayscaleServicesDim}%;`;

  const sizeDragArea = shouldShowDragArea ? verticalStyleOffset : 0;
  return horizontal
    ? `
    .sidebar {
      height: ${width}px !important;
      overflow: hidden !important;
    }
    .sidebar div {
      justify-content: ${sidebarServicesAlignment};
    }
    .tab-item {
      height: ${width - tabItemWidthBias}px !important;
      width: ${width + iconSize + tabItemHeightBias}px !important;
      min-height: unset;
      overflow: hidden !important;
    }
    .tab-item .tab-item__icon {
      width: ${minimumAdjustedIconSize}px !important;
      ${useGrayscaleServices ? graysacleServices : null},
    }
    .tab-item .tab-item__label {
      margin-left: 4px !important;
      font-size: ${fontSize}px !important;
    }
    .tab-item.is-label-enabled {
      padding-bottom: 0px !important;
    }
    .sidebar__button {
      font-size: ${width / 3}px !important;
    }
    .app .app__content {
      padding-top: ${width + sidebarSizeBias}px !important;
    }
    .workspaces-drawer {
      margin-top: -${width}px !important;
    }
    .darwin .sidebar {
      height: ${
        isFullScreen ? width : width + verticalStyleOffset - 3 - sizeDragArea
      }px !important;
      ${isFullScreen ? `padding-top: ${2}px !important` : null}
    }
    .darwin .app .app__content {
      padding-top: ${
        isFullScreen
          ? width
          : width +
            sidebarSizeBias +
            (sizeDragArea === 0 ? 4 : 4 - sizeDragArea)
      }px !important;
    }
    .darwin .workspaces-drawer {
      margin-top: -${
        width + verticalStyleOffset - 5 - sizeDragArea
      }px !important;
    }
    .darwin .sidebar .sidebar__button--workspaces.is-active {
      height: ${width - sidebarSizeBias}px !important;
    }
    .tab-item div {
      overflow: hidden !important;
    }
  `
    : `
    .sidebar {
      width: ${width}px !important;
    }
    .tabs {
      justify-content: ${sidebarServicesAlignment};
    }
    .tab-item {
      width: ${width}px !important;
      height: ${width - tabItemWidthBias}px !important;
      min-height: ${width - tabItemWidthBias}px !important;
    }
    .tab-item .tab-item__icon {
      width: ${minimumAdjustedIconSize}px !important;
      ${useGrayscaleServices ? graysacleServices : null},
    }
    .sidebar__button {
      font-size: ${width / 3}px !important;
    }
    .todos__todos-panel--expanded {
      width: calc(100% - ${300 + width}px) !important;
    }
  `;
}

function generateShowDragAreaStyle(accentColor) {
  return `
    .sidebar {
      padding-top: 0px !important;
    }
    .window-draggable {
      position: initial;
      background-color: ${accentColor};
    }
    #root {
      /** Remove 28px from app height, otherwise the page will be too high */
      height: calc(100% - 28px);
    }
  `;
}

function generateVerticalStyle(widthStr, alwaysShowWorkspaces) {
  if (!document.querySelector('#vertical-style')) {
    const link = document.createElement('link');
    link.id = 'vertical-style';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = './styles/vertical.css';

    document.head.append(link);
  }
  const width = Number(widthStr);
  const sidebarWidth = width - 4;
  const verticalStyleOffset = 29;

  return `
  .sidebar {
  ${
    alwaysShowWorkspaces
      ? `
    width: calc(100% - 300px) !important;
  `
      : ''
  }
  }

  .sidebar .sidebar__button {
    width: ${width}px;
  }

  .workspaces-drawer {
    margin-top: -${sidebarWidth - verticalStyleOffset - 1}px !important;
  }

  .todos__todos-panel--expanded {
    width: calc(100% - 300px) !important;
  }
  `;
}

function generateOpenWorkspaceStyle() {
  return `
  .app .app__content {
    width: 100%;
    transform: translateX(0px);
  }
  .sidebar__button--workspaces {
    display: none;
  }
  `;
}

function generateStyle(settings, app) {
  let style = '';

  const {
    accentColor,
    serviceRibbonWidth,
    sidebarServicesLocation,
    useGrayscaleServices,
    grayscaleServicesDim,
    iconSize,
    showDragArea,
    useHorizontalStyle,
    alwaysShowWorkspaces,
    showServiceName,
  } = settings;

  const { isFullScreen } = app;

  const shouldShowDragArea = showDragArea && !isFullScreen;

  if (
    accentColor.toLowerCase() !== DEFAULT_APP_SETTINGS.accentColor.toLowerCase()
  ) {
    style += generateAccentStyle(accentColor);
  }

  style += generateServiceRibbonWidthStyle(
    serviceRibbonWidth,
    iconSize,
    useHorizontalStyle,
    showServiceName,
    sidebarServicesLocation,
    useGrayscaleServices,
    grayscaleServicesDim,
    shouldShowDragArea,
    isFullScreen,
  );

  if (shouldShowDragArea) {
    style += generateShowDragAreaStyle(accentColor);
  }
  if (useHorizontalStyle) {
    style += generateVerticalStyle(serviceRibbonWidth, alwaysShowWorkspaces);
  } else if (document.querySelector('#vertical-style')) {
    const link = document.querySelector('#vertical-style');
    if (link) {
      link.remove();
    }
  }
  if (alwaysShowWorkspaces) {
    style += generateOpenWorkspaceStyle();
  }

  style += generateUserCustomCSS();

  return style;
}

function updateProgressbar(settings) {
  TopBarProgress.config({
    barThickness: 4,
    barColors: {
      '0': settings.progressbarAccentColor,
    },
    shadowBlur: 5,
  });
}

function updateStyle(settings, app) {
  const style = generateStyle(settings, app);
  setAppearance(style);
  updateProgressbar(settings);
}

export default function initAppearance(stores) {
  const { settings, app } = stores;
  createStyleElement();
  updateProgressbar(settings);

  // Update style when settings change
  reaction(
    () => [
      settings.all.app.accentColor,
      settings.all.app.progressbarAccentColor,
      settings.all.app.serviceRibbonWidth,
      settings.all.app.iconSize,
      settings.all.app.showDragArea,
      settings.all.app.sidebarServicesLocation,
      settings.all.app.useGrayscaleServices,
      settings.all.app.grayscaleServicesDim,
      settings.all.app.useHorizontalStyle,
      settings.all.app.alwaysShowWorkspaces,
      settings.all.app.showServiceName,
      app.isFullScreen,
    ],
    () => {
      updateStyle(settings.all.app, app);
    },
    { fireImmediately: true },
  );
}
