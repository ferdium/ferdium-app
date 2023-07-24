/* eslint-disable import/no-import-module-exports */
/* eslint-disable global-require */
import { parse } from 'path';
import { userDataRecipesPath } from '../environment-remote';

export function getRecipeDirectory(id: string = ''): string {
  return userDataRecipesPath(id);
}

export function getDevRecipeDirectory(id: string = ''): string {
  return userDataRecipesPath('dev', id);
}

export function loadRecipeConfig(recipeId: string) {
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
}

module.paths.unshift(getDevRecipeDirectory(), getRecipeDirectory());
