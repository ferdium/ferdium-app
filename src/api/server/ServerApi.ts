/* eslint-disable import/no-import-module-exports */
/* eslint-disable global-require */
import { join } from 'node:path';
import tar from 'tar';
import {
  readdirSync,
  statSync,
  writeFileSync,
  copySync,
  ensureDirSync,
  pathExistsSync,
  readJsonSync,
  removeSync,
  PathOrFileDescriptor,
} from 'fs-extra';

import ServiceModel from '../../models/Service';
import RecipePreviewModel, { IRecipePreview } from '../../models/RecipePreview';
import RecipeModel, { IRecipe } from '../../models/Recipe';
import UserModel from '../../models/User';

import sleep from '../../helpers/async-helpers';

import { SERVER_NOT_LOADED } from '../../config';
import { userDataRecipesPath, userDataPath } from '../../environment-remote';
import { asarRecipesPath } from '../../helpers/asar-helpers';
import apiBase from '../apiBase';
import {
  prepareAuthRequest,
  prepareLocalToken,
  sendAuthRequest,
} from '../utils/auth';

import {
  getRecipeDirectory,
  getDevRecipeDirectory,
  loadRecipeConfig,
} from '../../helpers/recipe-helpers';

import { removeServicePartitionDirectory } from '../../helpers/service-helpers';

const debug = require('../../preload-safe-debug')('Ferdium:ServerApi');

module.paths.unshift(getDevRecipeDirectory(), getRecipeDirectory());

export default class ServerApi {
  recipePreviews: IRecipePreview[] = [];

  recipes: IRecipe[] = [];

  // User
  async login(email: string, passwordHash: string) {
    const request = await sendAuthRequest(
      `${apiBase()}/auth/login`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${email}:${passwordHash}`,
          ).toString('base64')}`,
        },
      },
      false,
    );
    try {
      const responseJson = await request.json();

      if (!request.ok) {
        throw responseJson;
      }

      debug('ServerApi::login resolves', responseJson);
      return responseJson.token;
    } catch (error) {
      debug('ServerApi::login ERROR:', error);
      throw error;
    }
  }

  async signup(data: any) {
    const request = await sendAuthRequest(
      `${apiBase()}/auth/signup`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false,
    );
    try {
      const responseJson = await request.json();

      if (!request.ok) {
        throw responseJson;
      }

      debug('ServerApi::signup resolves', responseJson);
      return responseJson.token;
    } catch (error) {
      debug('ServerApi::signup ERROR:', error);
      throw error;
    }
  }

  async inviteUser(data: any) {
    const request = await sendAuthRequest(`${apiBase()}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!request.ok) {
      throw new Error(request.statusText);
    }

    debug('ServerApi::inviteUser');
    return true;
  }

  async retrievePassword(email: string) {
    const request = await sendAuthRequest(
      `${apiBase()}/auth/password`,
      {
        method: 'POST',
        body: JSON.stringify({
          email,
        }),
      },
      false,
    );
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const r = await request.json();

    debug('ServerApi::retrievePassword');
    return r;
  }

  async userInfo() {
    if (apiBase() === SERVER_NOT_LOADED) {
      throw new Error('Server not loaded');
    }

    const request = await sendAuthRequest(`${apiBase()}/me`);
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const data = await request.json();

    const user = new UserModel(data);
    debug('ServerApi::userInfo resolves', user);

    return user;
  }

  async updateUserInfo(data: any) {
    const request = await sendAuthRequest(`${apiBase()}/me`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const updatedData = await request.json();

    const user = Object.assign(updatedData, {
      data: new UserModel(updatedData.data),
    });
    debug('ServerApi::updateUserInfo resolves', user);
    return user;
  }

  async deleteAccount() {
    const request = await sendAuthRequest(`${apiBase()}/me`, {
      method: 'DELETE',
    });
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const data = await request.json();

    debug('ServerApi::deleteAccount resolves', data);
    return data;
  }

  // Services
  async getServices() {
    if (apiBase() === SERVER_NOT_LOADED) {
      throw new Error('Server not loaded');
    }

    const request = await sendAuthRequest(`${apiBase()}/me/services`);
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const data = await request.json();

    const services = await this._mapServiceModels(data);
    const filteredServices = services.filter(service => !!service);
    debug('ServerApi::getServices resolves', filteredServices);
    return filteredServices;
  }

  async createService(recipeId: string, data: { iconFile: any }) {
    const request = await sendAuthRequest(`${apiBase()}/service`, {
      method: 'POST',
      body: JSON.stringify({ recipeId, ...data }),
    });
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const serviceData = await request.json();

    if (data.iconFile) {
      const iconData = await this.uploadServiceIcon(
        serviceData.data.id,
        data.iconFile,
      );

      serviceData.data = iconData;
    }

    const service = Object.assign(serviceData, {
      data: await this._prepareServiceModel(serviceData.data),
    });

    debug('ServerApi::createService resolves', service);
    return service;
  }

  async updateService(serviceId: string, rawData: any) {
    const data = rawData;

    if (data.iconFile) {
      await this.uploadServiceIcon(serviceId, data.iconFile);
    }

    const request = await sendAuthRequest(`${apiBase()}/service/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!request.ok) {
      throw new Error(request.statusText);
    }

    const serviceData = await request.json();

    const service = Object.assign(serviceData, {
      data: await this._prepareServiceModel(serviceData.data),
    });

    debug('ServerApi::updateService resolves', service);
    return service;
  }

  async uploadServiceIcon(serviceId: string, icon: string | Blob) {
    const formData = new FormData();
    formData.append('icon', icon);

    const requestData = prepareAuthRequest({
      method: 'PUT',
      // @ts-expect-error Argument of type '{ method: string; body: FormData; }' is not assignable to parameter of type '{ method: string; }'.
      body: formData,
    });

    delete requestData.headers['Content-Type'];

    await prepareLocalToken(requestData);

    const request = await window.fetch(
      `${apiBase()}/service/${serviceId}`,
      // @ts-expect-error Argument of type '{ method: string; } & { mode: string; headers: any; }' is not assignable to parameter of type 'RequestInit | undefined'.
      requestData,
    );

    if (!request.ok) {
      throw new Error(request.statusText);
    }

    const serviceData = await request.json();

    return serviceData.data;
  }

  async reorderService(data: any) {
    const request = await sendAuthRequest(`${apiBase()}/service/reorder`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const serviceData = await request.json();
    debug('ServerApi::reorderService resolves', serviceData);
    return serviceData;
  }

  async deleteService(id: string) {
    const request = await sendAuthRequest(`${apiBase()}/service/${id}`, {
      method: 'DELETE',
    });
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const data = await request.json();

    removeServicePartitionDirectory(id, true);

    debug('ServerApi::deleteService resolves', data);
    return data;
  }

  // Features
  async getDefaultFeatures() {
    if (apiBase() === SERVER_NOT_LOADED) {
      throw new Error('Server not loaded');
    }

    const request = await sendAuthRequest(`${apiBase()}/features/default`);
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const data = await request.json();

    const features = data;
    debug('ServerApi::getDefaultFeatures resolves', features);
    return features;
  }

  async getFeatures() {
    if (apiBase() === SERVER_NOT_LOADED) {
      throw new Error('Server not loaded');
    }

    const request = await sendAuthRequest(`${apiBase()}/features`);
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const data = await request.json();

    const features = data;
    debug('ServerApi::getFeatures resolves', features);
    return features;
  }

  // Recipes
  async getInstalledRecipes() {
    const recipesDirectory = getRecipeDirectory();
    const paths = readdirSync(recipesDirectory).filter(
      file =>
        statSync(join(recipesDirectory, file)).isDirectory() &&
        file !== 'temp' &&
        file !== 'dev',
    );

    this.recipes = paths
      .map(id => {
        // eslint-disable-next-line import/no-dynamic-require
        const Recipe = require(id)(RecipeModel);
        return new Recipe(loadRecipeConfig(id));
      })
      .filter(recipe => recipe.id);

    // @ts-expect-error Type 'boolean' is not assignable to type 'ConcatArray<IRecipe>'.
    // eslint-disable-next-line unicorn/prefer-spread
    this.recipes = this.recipes.concat(this._getDevRecipes());

    debug('StubServerApi::getInstalledRecipes resolves', this.recipes);
    return this.recipes;
  }

  async getRecipeUpdates(recipeVersions: any) {
    const request = await sendAuthRequest(`${apiBase()}/recipes/update`, {
      method: 'POST',
      body: JSON.stringify(recipeVersions),
    });
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    const recipes = await request.json();
    debug('ServerApi::getRecipeUpdates resolves', recipes);
    return recipes;
  }

  // Recipes Previews
  async getRecipePreviews() {
    const request = await sendAuthRequest(`${apiBase()}/recipes`);
    if (!request.ok) throw new Error(request.statusText);
    const data = await request.json();
    const recipePreviews = this._mapRecipePreviewModel(data);
    debug('ServerApi::getRecipes resolves', recipePreviews);
    return recipePreviews;
  }

  async getFeaturedRecipePreviews() {
    const request = await sendAuthRequest(`${apiBase()}/recipes/popular`);
    if (!request.ok) throw new Error(request.statusText);

    const data = await request.json();
    // data = this._addLocalRecipesToPreviews(data);

    const recipePreviews = this._mapRecipePreviewModel(data);
    debug('ServerApi::getFeaturedRecipes resolves', recipePreviews);
    return recipePreviews;
  }

  async searchRecipePreviews(needle: string) {
    const url = `${apiBase()}/recipes/search?needle=${needle}`;
    const request = await sendAuthRequest(url);
    if (!request.ok) throw new Error(request.statusText);

    const data = await request.json();
    const recipePreviews = this._mapRecipePreviewModel(data);
    debug('ServerApi::searchRecipePreviews resolves', recipePreviews);
    return recipePreviews;
  }

  async getRecipePackage(recipeId: string) {
    const recipesDirectory = userDataRecipesPath();
    const recipeTempDirectory = join(recipesDirectory, 'temp', recipeId);
    const tempArchivePath = join(recipeTempDirectory, 'recipe.tar.gz');

    const internalRecipeFile = asarRecipesPath(`${recipeId}.tar.gz`);

    ensureDirSync(recipeTempDirectory);

    let archivePath: PathOrFileDescriptor;

    if (pathExistsSync(internalRecipeFile)) {
      debug('[ServerApi::getRecipePackage] Using internal recipe file');
      archivePath = internalRecipeFile;
    } else {
      debug('[ServerApi::getRecipePackage] Downloading recipe from server');
      archivePath = tempArchivePath;

      const packageUrl = `${apiBase()}/recipes/download/${recipeId}`;

      const res = await window.fetch(packageUrl);
      debug('Recipe downloaded', recipeId);
      const blob = await res.blob();
      const buffer = await blob.arrayBuffer();
      writeFileSync(tempArchivePath, Buffer.from(buffer));
    }
    debug(archivePath);

    await sleep(10);

    // @ts-expect-error No overload matches this call.
    await tar.x({
      file: archivePath,
      cwd: recipeTempDirectory,
      preservePaths: true,
      unlink: true,
      preserveOwner: false,
      onwarn: x => debug('warn', recipeId, x),
    });

    await sleep(10);

    const { id } = readJsonSync(join(recipeTempDirectory, 'package.json'));
    const recipeDirectory = join(recipesDirectory, id);
    copySync(recipeTempDirectory, recipeDirectory);
    removeSync(recipeTempDirectory);
    removeSync(join(recipesDirectory, recipeId, 'recipe.tar.gz'));

    return id;
  }

  // Health Check
  async healthCheck() {
    if (apiBase() === SERVER_NOT_LOADED) {
      throw new Error('Server not loaded');
    }

    const request = await sendAuthRequest(
      `${apiBase(false)}/health`,
      {
        method: 'GET',
      },
      false,
    );
    if (!request.ok) {
      throw new Error(request.statusText);
    }
    debug('ServerApi::healthCheck resolves');
  }

  async getLegacyServices() {
    const file = userDataPath('settings', 'services.json');

    try {
      const config = readJsonSync(file);

      if (Object.prototype.hasOwnProperty.call(config, 'services')) {
        const services = await Promise.all(
          config.services.map(async (s: { service: any }) => {
            const service = s;
            const request = await sendAuthRequest(
              `${apiBase()}/recipes/${s.service}`,
            );

            if (request.status === 200) {
              const data = await request.json();
              // @ts-expect-error Property 'recipe' does not exist on type '{ service: any; }'.
              service.recipe = new RecipePreviewModel(data);
            }

            return service;
          }),
        );

        debug('ServerApi::getLegacyServices resolves', services);
        return services;
      }
    } catch {
      console.error('ServerApi::getLegacyServices no config found');
    }

    return [];
  }

  // Helper
  async _mapServiceModels(services: any[]) {
    const recipes = services.map((s: { recipeId: string }) => s.recipeId);
    await this._bulkRecipeCheck(recipes);

    return Promise.all(
      services.map(async (service: any) => this._prepareServiceModel(service)),
    );
    /* eslint-enable no-return-await */
  }

  async _prepareServiceModel(service: { recipeId: string }) {
    try {
      const recipe = this.recipes.find(r => r.id === service.recipeId);

      if (!recipe) {
        console.warn(`Recipe ${service.recipeId} not loaded`);
        return null;
      }

      return new ServiceModel(service, recipe);
    } catch (error) {
      debug(error);
      return null;
    }
  }

  async _bulkRecipeCheck(unfilteredRecipes: string[]) {
    // Filter recipe duplicates as we don't need to download 3 Slack recipes
    const recipes = unfilteredRecipes.filter(
      (elem: string, pos: number, arr: string[]) => arr.indexOf(elem) === pos,
    );

    return Promise.all(
      recipes.map(async (recipeId: string) => {
        let recipe = this.recipes.find(r => r.id === recipeId);

        if (!recipe) {
          console.warn(
            `Recipe '${recipeId}' not installed, trying to fetch from server`,
          );

          await this.getRecipePackage(recipeId);

          debug('Rerun ServerAPI::getInstalledRecipes');
          await this.getInstalledRecipes();

          recipe = this.recipes.find(r => r.id === recipeId);

          if (!recipe) {
            console.warn(`Could not load recipe ${recipeId}`);
            return null;
          }
        }

        return recipe;
      }),
    ).catch(error => console.error("Can't load recipe", error));
  }

  _mapRecipePreviewModel(recipes: IRecipePreview[]) {
    return recipes
      .map(recipe => {
        try {
          return new RecipePreviewModel(recipe);
        } catch (error) {
          console.error(error);
          return null;
        }
      })
      .filter(Boolean);
  }

  _getDevRecipes() {
    const recipesDirectory = getDevRecipeDirectory();
    try {
      const paths = readdirSync(recipesDirectory).filter(
        file =>
          statSync(join(recipesDirectory, file)).isDirectory() &&
          file !== 'temp',
      );

      const recipes = paths
        .map(id => {
          try {
            // eslint-disable-next-line import/no-dynamic-require
            const Recipe = require(id)(RecipeModel);

            return new Recipe(loadRecipeConfig(id));
          } catch (error) {
            console.error(error);
          }
          return false;
        })
        .filter(recipe => recipe.id)
        .map(data => {
          const recipe = data;

          recipe.icons = {
            svg: `${recipe.path}/icon.svg`,
          };
          recipe.local = true;

          return data;
        });

      return recipes;
    } catch {
      debug('Could not load dev recipes');
      return false;
    }
  }
}
