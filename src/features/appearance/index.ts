import color from 'color';
import { reaction } from 'mobx';
import TopBarProgress from 'react-topbar-progress-indicator';

import { pathExistsSync, readFileSync } from 'fs-extra';
import {
  DEFAULT_APP_SETTINGS,
  SERVICE_WEBVIEW_BORDER_RADIUS_DEFAULT,
  SERVICE_WEBVIEW_BORDER_RADIUS_MAX,
  SERVICE_WEBVIEW_BORDER_RADIUS_MIN,
  SIDEBAR_SERVICES_LOCATION_BOTTOMRIGHT,
  SIDEBAR_SERVICES_LOCATION_CENTER,
  SIDEBAR_SERVICES_LOCATION_TOPLEFT,
  WEBVIEW_PADDING_SIZE_DEFAULT,
  WEBVIEW_PADDING_SIZE_MAX,
  WEBVIEW_PADDING_SIZE_MIN,
  iconSizeBias,
} from '../../config';
import { isLinux, isWindows } from '../../environment';
import { userDataPath } from '../../environment-remote';
import { workspaceStore } from '../workspaces';

const STYLE_ELEMENT_ID = 'custom-appearance-style';

const WEBVIEW_PADDING_VAR = 'var(--webview-padding)';

const normalizeWebviewPaddingSize = paddingSize => {
  const value = Number(paddingSize);

  if (!Number.isFinite(value)) {
    return WEBVIEW_PADDING_SIZE_DEFAULT;
  }

  return Math.min(
    WEBVIEW_PADDING_SIZE_MAX,
    Math.max(WEBVIEW_PADDING_SIZE_MIN, value),
  );
};

const normalizeServiceWebviewBorderRadius = borderRadius => {
  const value = Number(borderRadius);

  if (!Number.isFinite(value)) {
    return SERVICE_WEBVIEW_BORDER_RADIUS_DEFAULT;
  }

  return Math.min(
    SERVICE_WEBVIEW_BORDER_RADIUS_MAX,
    Math.max(SERVICE_WEBVIEW_BORDER_RADIUS_MIN, value),
  );
};

const createStyleElement = () => {
  const styles = document.createElement('style');
  styles.id = STYLE_ELEMENT_ID;

  document.querySelector('head')?.append(styles);
};

const setAppearance = style => {
  const styleElement = document.querySelector(`#${STYLE_ELEMENT_ID}`);

  if (styleElement) {
    styleElement.innerHTML = style;
  }
};

// See https://github.com/Qix-/color/issues/53#issuecomment-656590710
const darkenAbsolute = (originalColor, absoluteChange) => {
  const originalLightness = originalColor.lightness();
  return originalColor.lightness(originalLightness - absoluteChange);
};

const generateUserCustomCSS = () => {
  const path = userDataPath('config', 'custom.css');
  return pathExistsSync(path) ? readFileSync(path).toString() : '';
};

const generateAccentStyle = accentColorStr => {
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
};

const generateWebviewLayoutStyle = (paddingSize, borderRadius) => {
  return `
    :root {
      --webview-padding: ${normalizeWebviewPaddingSize(paddingSize)}px;
      --service-webview-border-radius: ${normalizeServiceWebviewBorderRadius(
        borderRadius,
      )}px;
    }
    .services__webview-wrapper {
      border-radius: var(--service-webview-border-radius);
      clip-path: inset(0 round var(--service-webview-border-radius));
      overflow: hidden;
    }
    .services__webview-wrapper webview {
      border-radius: var(--service-webview-border-radius);
    }
  `;
};

const generateServiceRibbonWidthStyle = (
  widthStr,
  iconSizeStr,
  horizontal,
  isLabelEnabled,
  sidebarServicesLocation,
  useGrayscaleServices,
  grayscaleServicesDim,
  shouldShowDragArea,
  isFullScreen,
) => {
  const width = Number(widthStr);
  const iconSize = Number(iconSizeStr) - iconSizeBias;
  const tabItemWidthBias = 1;
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
      sidebarServicesAlignment = 'flex-start';
      break;
    }
    case SIDEBAR_SERVICES_LOCATION_CENTER: {
      sidebarServicesAlignment = 'center';
      break;
    }
    case SIDEBAR_SERVICES_LOCATION_BOTTOMRIGHT: {
      sidebarServicesAlignment = 'flex-end';
      break;
    }
    default: {
      sidebarServicesAlignment = 'flex-start';
      break;
    }
  }
  const overflowSafeSidebarServicesAlignment =
    sidebarServicesAlignment === 'flex-start'
      ? sidebarServicesAlignment
      : `safe ${sidebarServicesAlignment}`;

  const graysacleServices = `filter: grayscale(1);
  opacity: ${grayscaleServicesDim}%;`;

  const sizeDragArea = shouldShowDragArea ? verticalStyleOffset : 0;
  const webviewInset = WEBVIEW_PADDING_VAR;
  const horizontalContentOffsetBase = width + sidebarSizeBias;
  const horizontalContentOffset = `calc(${horizontalContentOffsetBase}px + ${WEBVIEW_PADDING_VAR})`;
  const currentDarwinHorizontalContentOffset = isFullScreen
    ? width
    : width + sidebarSizeBias + (sizeDragArea === 0 ? 4 : 4 - sizeDragArea);
  const darwinSidebarTopInset = isFullScreen
    ? 2
    : shouldShowDragArea
      ? 0
      : verticalStyleOffset;
  const darwinHorizontalContentOffsetBase = darwinSidebarTopInset + width;
  const darwinHorizontalContentOffset = `max(
    ${currentDarwinHorizontalContentOffset}px,
    calc(${darwinHorizontalContentOffsetBase}px + ${WEBVIEW_PADDING_VAR})
  )`;
  const darwinDrawerTopOffset = darwinHorizontalContentOffset;

  return horizontal
    ? `
    .sidebar {
      height: calc(${width}px + ${WEBVIEW_PADDING_VAR}) !important;
      overflow: hidden !important;
    }
    .sidebar .tabs {
      justify-content: ${overflowSafeSidebarServicesAlignment};
    }
    .tab-item {
      height: ${width - tabItemWidthBias}px !important;
      width: ${width + iconSize + tabItemHeightBias}px !important;
      min-width: ${width + iconSize + tabItemHeightBias}px !important;
      min-height: unset;
      flex-shrink: 0;
      overflow: hidden !important;
    }
    .tab-item .tab-item__icon {
      width: ${minimumAdjustedIconSize}px !important;
      ${useGrayscaleServices ? graysacleServices : null},
    }
    .tab-item .tab-item__label {
      font-size: ${fontSize}px !important;
    }
    .sidebar__button {
      align-items: center;
      align-self: flex-start;
      display: flex;
      font-size: ${width / 3}px !important;
      height: ${width - tabItemWidthBias}px !important;
      justify-content: center;
      line-height: 0;
      margin-top: ${WEBVIEW_PADDING_VAR} !important;
      padding: 0 !important;
      width: ${width}px !important;
    }
    .app .app__content {
      padding-top: ${horizontalContentOffset} !important;
    }
    .app .app__service {
      padding: ${webviewInset} !important;
    }
    .workspaces-drawer {
      height: calc(100% + ${horizontalContentOffsetBase}px + ${WEBVIEW_PADDING_VAR}) !important;
      margin-top: calc(0px - ${horizontalContentOffsetBase}px - ${WEBVIEW_PADDING_VAR}) !important;
    }
    .darwin .sidebar {
      height: ${darwinHorizontalContentOffset} !important;
      ${isFullScreen ? `padding-top: ${2}px !important` : null}
    }
    .darwin .app .app__content {
      padding-top: ${darwinHorizontalContentOffset} !important;
    }
    .darwin .workspaces-drawer {
      height: calc(100% + ${darwinDrawerTopOffset}) !important;
      margin-top: calc(0px - ${darwinDrawerTopOffset}) !important;
    }
    .darwin .sidebar .sidebar__button--workspaces.is-active {
      height: ${width - tabItemWidthBias}px !important;
    }
    .tab-item div {
      overflow: hidden !important;
    }
  `
    : `
    .sidebar {
      width: calc(${width}px + ${WEBVIEW_PADDING_VAR}) !important;
    }
    .sidebar .tabs {
      justify-content: ${overflowSafeSidebarServicesAlignment};
    }
    .tab-item {
      width: ${width}px !important;
      height: ${width - tabItemWidthBias}px !important;
      min-height: ${width - tabItemWidthBias}px !important;
      flex-shrink: 0;
    }
    .tab-item .tab-item__icon {
      width: ${minimumAdjustedIconSize}px !important;
      ${useGrayscaleServices ? graysacleServices : null},
    }
    .sidebar__button {
      align-items: center;
      align-self: flex-end;
      display: flex;
      font-size: ${width / 3}px !important;
      justify-content: center;
      width: ${width}px !important;
    }
    .app .app__service {
      padding: ${webviewInset} !important;
    }
    .todos__todos-panel--expanded {
      width: calc(100% - ${300 + width}px) !important;
    }
  `;
};

const generateShowDragAreaStyle = accentColor => {
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
};

const generateCompactWorkspaceDrawerStyle = (
  widthStr,
  useCompactWorkspaceDrawer,
  shouldShowDragArea,
  isFullScreen,
) => {
  if (!useCompactWorkspaceDrawer) {
    return '';
  }

  const width = Number(widthStr);
  const tabItemWidthBias = 1;
  const itemHeight = width - tabItemWidthBias;
  const compactDrawerWidth = `calc(${width}px + ${WEBVIEW_PADDING_VAR})`;
  const darwinWorkspaceDrawerTopInset = isFullScreen
    ? 2
    : shouldShowDragArea
      ? 0
      : 29;

  return `
  .app--compact-workspace {
    --workspace-drawer-width: ${compactDrawerWidth} !important;
  }
  .workspaces-drawer.compact {
    width: ${compactDrawerWidth} !important;
  }
  .darwin .workspaces-drawer.compact {
    padding-top: ${darwinWorkspaceDrawerTopInset}px !important;
  }
  .workspaces-drawer [data-tooltip-id="tooltip-workspaces-drawer"].compact {
    height: ${itemHeight}px !important;
    min-height: ${itemHeight}px !important;
  }
  .app__service > div[class*="WorkspaceSwitchingIndicator-wrapper"] {
    width: calc(100% - ${width}px - ${WEBVIEW_PADDING_VAR}) !important;
  }
  `;
};

let isChangingDrawerSettings = false;
let drawerSettingsTimeout: NodeJS.Timeout | null = null;

const generateWorkspaceDrawerTransform = (
  widthStr,
  useCompactWorkspaceDrawer,
  isWorkspaceDrawerOpen,
  alwaysShowWorkspaces,
) => {
  // When drawer is open or always show is enabled, don't override - let JSS handle the transition
  if (isWorkspaceDrawerOpen || alwaysShowWorkspaces) {
    return '';
  }

  // When drawer is closed, apply transform
  const drawerWidth = useCompactWorkspaceDrawer
    ? `calc(0px - ${Number(widthStr)}px - ${WEBVIEW_PADDING_VAR})`
    : '-300px';

  // Disable transition only when actively changing drawer settings (ribbon width or compact mode)
  const transitionStyle = isChangingDrawerSettings
    ? 'transition: none !important;'
    : '';

  return `
  .app__content {
    transform: translateX(${drawerWidth}) !important;
    ${transitionStyle}
  }
  `;
};

const generateVerticalStyle = (
  widthStr,
  alwaysShowWorkspaces,
  useCompactWorkspaceDrawer,
) => {
  if (!document.querySelector('#vertical-style')) {
    const link = document.createElement('link');
    link.id = 'vertical-style';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = './styles/vertical.css';

    document.head.append(link);
  }
  const width = Number(widthStr);
  const drawerWidth = useCompactWorkspaceDrawer
    ? `calc(100% - ${width}px - ${WEBVIEW_PADDING_VAR})`
    : 'calc(100% - 300px)';
  const todosPanelWidth = useCompactWorkspaceDrawer
    ? `calc(100% - ${width * 2}px - ${WEBVIEW_PADDING_VAR})`
    : `calc(100% - ${300 + width}px)`;

  return `
  .sidebar {
  ${
    alwaysShowWorkspaces
      ? `
    width: ${drawerWidth} !important;
  `
      : ''
  }
  }

  .sidebar .sidebar__button {
    width: ${width}px;
  }

  .todos__todos-panel--expanded {
    width: ${todosPanelWidth} !important;
  }
  `;
};

const generateOpenWorkspaceStyle = () => {
  return `
  .app .app__content {
    width: 100% !important;
    transform: translateX(0px) !important;
  }
  .sidebar__button--workspaces {
    display: none;
  }
  `;
};

const generateAppContentTransition = alwaysShowWorkspaces => {
  const reducedMotionQuery = window?.matchMedia?.(
    '(prefers-reduced-motion: no-preference)',
  );
  const widthTransition = reducedMotionQuery?.matches
    ? 'width 0.5s ease'
    : 'none';

  // Disable all transitions when changing drawer settings
  if (isChangingDrawerSettings) {
    return `
  .app .app__content {
    transition: none !important;
  }
  `;
  }

  // Only add width transition when Always Show is active to prevent bounce
  const transitionValue = alwaysShowWorkspaces
    ? `transform 0.5s ease, ${widthTransition}`
    : 'transform 0.5s ease';

  return `
  .app .app__content {
    transition: ${transitionValue} !important;
  }
  `;
};

const generateStyle = (settings, app) => {
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
    useCompactWorkspaceDrawer,
    webviewPaddingSize,
    serviceWebviewBorderRadius,
  } = settings;

  const { isFullScreen } = app;

  const shouldShowDragArea = showDragArea && !isFullScreen;

  style += generateWebviewLayoutStyle(
    webviewPaddingSize,
    serviceWebviewBorderRadius,
  );

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

  style += generateCompactWorkspaceDrawerStyle(
    serviceRibbonWidth,
    useCompactWorkspaceDrawer,
    shouldShowDragArea,
    isFullScreen,
  );

  style += generateWorkspaceDrawerTransform(
    serviceRibbonWidth,
    useCompactWorkspaceDrawer,
    workspaceStore.isWorkspaceDrawerOpen,
    alwaysShowWorkspaces,
  );

  if (shouldShowDragArea) {
    style += generateShowDragAreaStyle(accentColor);
  }
  if (useHorizontalStyle) {
    style += generateVerticalStyle(
      serviceRibbonWidth,
      alwaysShowWorkspaces,
      useCompactWorkspaceDrawer,
    );
  } else if (document.querySelector('#vertical-style')) {
    const link = document.querySelector('#vertical-style');
    if (link) {
      link.remove();
    }
  }
  if (alwaysShowWorkspaces) {
    style += generateOpenWorkspaceStyle();
  }

  // Always add transition to app__content for smooth animations
  style += generateAppContentTransition(alwaysShowWorkspaces);

  style += generateUserCustomCSS();

  return style;
};

const updateProgressbar = settings => {
  TopBarProgress.config({
    barThickness: 4,
    barColors: {
      '0': settings.progressbarAccentColor,
    },
    shadowBlur: 5,
  });
};

const updateStyle = (settings, app) => {
  const appSettings = settings.all?.app ?? settings;
  const style = generateStyle(appSettings, app);
  setAppearance(style);
  updateProgressbar(appSettings);
};

export default function initAppearance(stores) {
  const { settings, app } = stores;
  createStyleElement();
  updateProgressbar(settings.all.app);

  // Track drawer settings changes (ribbon width and compact mode) to disable transition temporarily
  reaction(
    () => [
      settings.all.app.serviceRibbonWidth,
      settings.all.app.useCompactWorkspaceDrawer,
    ],
    () => {
      // Disable transitions only if drawer is closed and always show is off
      const shouldDisableTransitions =
        !workspaceStore.isWorkspaceDrawerOpen &&
        !settings.all.app.alwaysShowWorkspaces;

      if (shouldDisableTransitions) {
        if (drawerSettingsTimeout) {
          clearTimeout(drawerSettingsTimeout);
        }
        isChangingDrawerSettings = true;
        updateStyle(settings, app);

        // Re-enable transition after a brief delay
        drawerSettingsTimeout = setTimeout(() => {
          isChangingDrawerSettings = false;
          updateStyle(settings, app);
        }, 50);
      } else {
        // Always update style even when transitions should be enabled
        updateStyle(settings, app);
      }
    },
  );

  // Update style when settings change
  reaction(
    () => [
      settings.all.app.accentColor,
      settings.all.app.progressbarAccentColor,
      settings.all.app.iconSize,
      settings.all.app.showDragArea,
      settings.all.app.sidebarServicesLocation,
      settings.all.app.useGrayscaleServices,
      settings.all.app.grayscaleServicesDim,
      settings.all.app.useHorizontalStyle,
      settings.all.app.alwaysShowWorkspaces,
      settings.all.app.showServiceName,
      settings.all.app.useCompactWorkspaceDrawer,
      settings.all.app.webviewPaddingSize,
      settings.all.app.serviceWebviewBorderRadius,
      app.isFullScreen,
      workspaceStore.isWorkspaceDrawerOpen,
    ],
    () => {
      updateStyle(settings, app);
    },
    { fireImmediately: true },
  );
}
