/* eslint-disable import/no-import-module-exports */
/* eslint-disable global-require */
import { parse } from 'node:path';
import type { IntlShape } from 'react-intl';
import { userDataRecipesPath } from '../environment-remote';
import { getTranslatedText } from './i18n-helpers';

export const getRecipeDirectory = (id: string = ''): string => {
  return userDataRecipesPath(id);
};

export const getDevRecipeDirectory = (id: string = ''): string => {
  return userDataRecipesPath('dev', id);
};

export const loadRecipeConfig = (recipeId: string) => {
  try {
    const configPath = `${recipeId}/package.json`;
    // Delete module from cache
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete require.cache[require.resolve(configPath)];

    // eslint-disable-next-line import/no-dynamic-require
    const config = require(configPath);

    const moduleConfigPath = require.resolve(configPath);
    config.path = parse(moduleConfigPath).dir;

    return config;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Get localized recipe name for display
 * Supports both React components (using IntlShape) and non-React components (using locale string)
 *
 * Translation key naming convention: `recipe.{recipeId}.name`
 * - The function automatically constructs the translation key from the recipeId
 * - If a translation exists, it will be used; otherwise, falls back to recipeName
 * - No source code changes needed to add i18n support for new recipes
 *
 * Example: To add i18n support for 'whatsapp' recipe:
 * 1. Add to en-US.json: "recipe.whatsapp.name": "WhatsApp"
 * 2. Add to zh-HANS.json: "recipe.whatsapp.name": "WhatsApp"
 * 3. No code changes required!
 *
 * @param recipeId - The recipe ID (e.g., 'franz-custom-website', 'whatsapp')
 * @param recipeName - The fallback recipe name from package.json
 * @param localeOrIntl - Either a locale string (e.g., 'en-US') or an IntlShape object from react-intl
 * @returns Localized recipe name if translation exists, otherwise returns recipeName
 */
export const getLocalizedRecipeName = (
  recipeId: string,
  recipeName: string,
  localeOrIntl: string | IntlShape,
): string => {
  // Construct translation key following the convention: recipe.{recipeId}.name
  const translationKey = `recipe.${recipeId}.name`;

  // If localeOrIntl is an IntlShape object (has formatMessage method)
  if (typeof localeOrIntl === 'object' && 'formatMessage' in localeOrIntl) {
    return localeOrIntl.formatMessage(
      {
        id: translationKey,
        defaultMessage: recipeName,
      },
      {},
    );
  }

  // If localeOrIntl is a locale string
  return getTranslatedText(localeOrIntl as string, translationKey, recipeName);
};

module.paths.unshift(getDevRecipeDirectory(), getRecipeDirectory());
