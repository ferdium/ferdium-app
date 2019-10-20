import { reaction } from 'mobx';
import themeInfo from '../../assets/themeInfo.json';
import { DEFAULT_APP_SETTINGS } from '../../config';

const STYLE_ELEMENT_ID = 'accent-color';

function createAccentStyleElement() {
  const styles = document.createElement('style');
  styles.id = STYLE_ELEMENT_ID;

  document.querySelector('head').appendChild(styles);
}

function setAccentStyle(style) {
  const styleElement = document.getElementById(STYLE_ELEMENT_ID);
  styleElement.innerHTML = style;
}

function generateAccentStyle(color) {
  let style = '';

  Object.keys(themeInfo).forEach((property) => {
    style += `
      ${themeInfo[property]} {
        ${property}: ${color};
      }
    `;
  });

  return style;
}

export default function initAccentColor(stores) {
  const { settings } = stores;
  createAccentStyleElement();

  // Update accent color
  reaction(
    () => (
      settings.all.app.accentColor
    ),
    (color) => {
      if (color === DEFAULT_APP_SETTINGS.accentColor) {
        // Reset accent style to return to default color scheme
        setAccentStyle('');
      } else {
        const style = generateAccentStyle(color);
        setAccentStyle(style);
      }
    },
    {
      fireImmediately: true,
    },
  );
}
