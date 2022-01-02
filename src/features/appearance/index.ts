import color from 'color';
import { reaction } from 'mobx';
import { DEFAULT_APP_SETTINGS, iconSizeBias } from '../../config';

const STYLE_ELEMENT_ID = 'custom-appearance-style';

function createStyleElement() {
  const styles = document.createElement('style');
  styles.id = STYLE_ELEMENT_ID;

  document.querySelector('head')?.appendChild(styles);
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

function generateAccentStyle(accentColorStr) {
  let accentColor;
  try {
    accentColor = color(accentColorStr);
  } catch {
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
    .ferdi__fab,
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
  vertical,
  isLabelEnabled,
) {
  const width = Number(widthStr);
  const iconSize = Number(iconSizeStr) - iconSizeBias;
  let fontSize = 11;
  let tabItemHeightBias = -5;
  let sidebarSizeBias = 22;
  const tabItemWidthBias = 2;

  switch (width) {
    case 35:
      fontSize = 9;
      tabItemHeightBias = 25;
      sidebarSizeBias = 48;
      break;
    case 45:
      fontSize = 10;
      tabItemHeightBias = 21;
      sidebarSizeBias = 44;
      break;
    case 55:
      fontSize = 11;
      tabItemHeightBias = 13;
      sidebarSizeBias = 37;
      break;
    case 80:
      fontSize = 11;
      tabItemHeightBias = 3;
      sidebarSizeBias = 27;
      break;
    case 90:
      fontSize = 12;
      tabItemHeightBias = 0;
      sidebarSizeBias = 25;
      break;
    case 100:
      fontSize = 13;
      tabItemHeightBias = 2;
      sidebarSizeBias = 25;
      break;
    default:
      fontSize = 11;
      tabItemHeightBias = 13;
      sidebarSizeBias = 37;
  }

  if (!isLabelEnabled) {
    sidebarSizeBias = 22;
    tabItemHeightBias = -5;
  }

  // Due to the lowest values for SIDEBAR_WIDTH and ICON_SIZES, this can be computed to a negative value
  const minimumAdjustedIconSize = Math.max(width / 2 + iconSize, 2);

  return vertical
    ? `
    .sidebar {
      height: ${width}px !important;
      overflow: hidden !important;
    }
    .tab-item {
      height: ${width - tabItemWidthBias}px !important;
      width: ${width + iconSize + tabItemHeightBias}px !important;
      min-height: unset;
      overflow: hidden !important;
    }
    .tab-item .tab-item__icon {
      width: ${minimumAdjustedIconSize}px !important;
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
      height: ${width + sidebarSizeBias}px !important;
    }
    .darwin .sidebar .sidebar__button--workspaces.is-active {
      height: ${width - sidebarSizeBias}px !important;
    }
    .tab-item .tab-item__label{
      font-size: ${fontSize}px !important;
    }
    .tab-item div{
      overflow: hidden !important;
    }
  `
    : `
    .sidebar {
      width: ${width}px !important;
    }
    .tab-item {
      width: ${width}px !important;
      height: min-content !important;
    }
    .tab-item .tab-item__icon {
      width: ${minimumAdjustedIconSize}px !important;
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
      /** Remove 22px from app height, otherwise the page will be too high */
      height: calc(100% - 22px);
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
  const verticalStyleOffset = 23;

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

function generateStyle(settings) {
  let style = '';

  const {
    accentColor,
    serviceRibbonWidth,
    iconSize,
    showDragArea,
    useVerticalStyle,
    alwaysShowWorkspaces,
    showServiceName,
  } = settings;

  if (
    accentColor.toLowerCase() !== DEFAULT_APP_SETTINGS.accentColor.toLowerCase()
  ) {
    style += generateAccentStyle(accentColor);
  }
  if (
    serviceRibbonWidth !== DEFAULT_APP_SETTINGS.serviceRibbonWidth ||
    iconSize !== DEFAULT_APP_SETTINGS.iconSize
  ) {
    style += generateServiceRibbonWidthStyle(
      serviceRibbonWidth,
      iconSize,
      useVerticalStyle,
      showServiceName,
    );
  }
  if (showDragArea) {
    style += generateShowDragAreaStyle(accentColor);
  }
  if (useVerticalStyle) {
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

  return style;
}
function updateStyle(settings) {
  const style = generateStyle(settings);
  setAppearance(style);
}

export default function initAppearance(stores) {
  const { settings } = stores;
  createStyleElement();

  // Update style when settings change
  reaction(
    () => [
      settings.all.app.accentColor,
      settings.all.app.serviceRibbonWidth,
      settings.all.app.iconSize,
      settings.all.app.showDragArea,
      settings.all.app.useVerticalStyle,
      settings.all.app.alwaysShowWorkspaces,
      settings.all.app.showServiceName,
    ],
    () => {
      updateStyle(settings.all.app);
    },
    { fireImmediately: true },
  );
}
