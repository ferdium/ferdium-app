import { cleanseJSObject, convertToJSON } from '../../jsUtils';

type Recipe = {
  setBadge: (direct: number, indirect: number) => void;
  setDialogTitle: (title: string) => void;
  injectCSS: (css: string | string[]) => void;
};

export default class Userscript {
  // Current ./lib/RecipeWebview instance
  recipe: Recipe | null = null;

  // Current ./recipe.js instance
  controller = null;

  // Service configuration
  config = {};

  // Ferdium and service settings
  settings = {};

  constructor(recipe, controller, config) {
    this.recipe = recipe;
    this.controller = controller;
    this.internal_setSettings(controller.settings);
    this.config = config;
  }

  /**
   * Set internal copy of Ferdium's settings.
   * This is only used internally and can not be used to change any settings
   *
   * @param {*} settings
   */

  internal_setSettings(settings: any) {
    // This is needed to get a clean JS object from the settings itself to provide better accessibility
    // Otherwise this will be a mobX instance
    this.settings = cleanseJSObject(settings);
  }

  /**
   * Set badge count for the current service
   * @param {number} direct Direct messages
   * @param {number} indirect Indirect messages
   */
  setBadge(direct: number = 0, indirect: number = 0) {
    if (this.recipe?.setBadge) {
      this.recipe.setBadge(direct, indirect);
    }
  }

  /**
   * Set active dialog title to the app title
   * @param {*} title Dialog title
   */
  setDialogTitle(title: string) {
    if (this.recipe?.setDialogTitle) {
      this.recipe.setDialogTitle(title);
    }
  }

  /**
   * Inject CSS files into the current page
   *
   * @param  {...string} files
   */
  injectCSSFiles(...files: string[]) {
    if (this.recipe?.injectCSS) {
      // @ts-expect-error A spread argument must either have a tuple type or be passed to a rest parameter.
      this.recipe.injectCSS(...files);
    }
  }

  /**
   * Inject a CSS string into the page
   *
   * @param {string} css
   */
  injectCSS(css: string) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
  }

  /**
   * Set or update value in storage
   *
   * @param {string} key
   * @param {any} value
   */
  set(key: string, value: string) {
    window.localStorage.setItem(`ferdium-user-${key}`, JSON.stringify(value));
  }

  /**
   * Get value from storage
   *
   * @param {string} key
   * @return Value of the key
   */
  // eslint-disable-next-line consistent-return
  get(key: string) {
    const ferdiumUserKey = window.localStorage.getItem(`ferdium-user-${key}`);

    if (ferdiumUserKey) {
      return convertToJSON(ferdiumUserKey);
    }
  }
}
