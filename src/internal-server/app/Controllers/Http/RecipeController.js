const Recipe = use('App/Models/Recipe');
const Drive = use('Drive');
const { validateAll } = use('Validator');
const Env = use('Env');

const fetch = require('node-fetch');
const debug = require('debug')('Ferdi:internalServer:RecipeController');
const { LIVE_FERDI_API } = require('../../../../config');
const { API_VERSION } = require('../../../../environment-remote');

const RECIPES_URL = `${LIVE_FERDI_API}/${API_VERSION}/recipes`;

class RecipeController {
  // List official and custom recipes
  async list({ response }) {
    const recipesUrlFetch = await fetch(RECIPES_URL);
    const officialRecipes = JSON.parse(await recipesUrlFetch.text());
    const allRecipes = await Recipe.all();
    const customRecipesArray = allRecipes.rows;
    const customRecipes = customRecipesArray.map(recipe => ({
      id: recipe.recipeId,
      name: recipe.name,
      ...JSON.parse(recipe.data),
    }));

    const recipes = [...officialRecipes, ...customRecipes];

    return response.send(recipes);
  }

  // Search official and custom recipes
  async search({ request, response }) {
    // Validate user input
    const validation = await validateAll(request.all(), {
      needle: 'required',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Please provide a needle',
        messages: validation.messages(),
        status: 401,
      });
    }

    const needle = request.input('needle');

    // Get results
    let results;

    if (needle === 'ferdi:custom') {
      const allRecipes = await Recipe.all();
      const dbResults = allRecipes.toJSON();
      results = dbResults.map(recipe => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...JSON.parse(recipe.data),
      }));
    } else {
      let remoteResults = [];
      // eslint-disable-next-line eqeqeq
      if (Env.get('CONNECT_WITH_FRANZ') == 'true') {
        const recipesUrlFetch = await fetch(
          `${RECIPES_URL}/search?needle=${encodeURIComponent(needle)}`,
        );
        remoteResults = JSON.parse(await recipesUrlFetch.text());
      }

      debug('remoteResults:', remoteResults);

      const recipeQuery = await Recipe.query()
        .where('name', 'LIKE', `%${needle}%`)
        .fetch();
      const localResultsArray = recipeQuery.toJSON();
      const localResults = localResultsArray.map(recipe => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...JSON.parse(recipe.data),
      }));

      debug('localResults:', localResults);

      results = [...localResults, ...(remoteResults || [])];
    }

    return response.send(results);
  }

  async update({ request, response }) {
    // eslint-disable-next-line eqeqeq
    if (Env.get('CONNECT_WITH_FRANZ') == 'true') {
      const body = request.all();
      const remoteUpdates = await fetch(`${RECIPES_URL}/update`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
      });
      return response.send(await remoteUpdates.json());
    }
    return response.send([]);
  }

  async popularRecipes({
    response,
  }) {
    const recipesUrlFetch = await fetch(`${RECIPES_URL}/popular`);
    const featuredRecipes = JSON.parse(await recipesUrlFetch.text());
    return response.send(featuredRecipes);
  }

  // Download a recipe
  async download({ response, params }) {
    // Validate user input
    const validation = await validateAll(params, {
      recipe: 'required|accepted',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Please provide a recipe ID',
        messages: validation.messages(),
        status: 401,
      });
    }

    const service = params.recipe;

    // eslint-disable-next-line eqeqeq
    if (Env.get('CONNECT_WITH_FRANZ') == 'true') {
      return response.redirect(`${RECIPES_URL}/download/${service}`);
    }
    // Check for invalid characters
    if (/\.+/.test(service) || /\/+/.test(service)) {
      return response.send('Invalid recipe name');
    }
    // Check if recipe exists in recipes folder
    if (await Drive.exists(`${service}.tar.gz`)) {
      return response.send(await Drive.get(`${service}.tar.gz`));
    }
    return response.status(400).send({
      message: 'Recipe not found',
      code: 'recipe-not-found',
    });
  }
}

module.exports = RecipeController;
