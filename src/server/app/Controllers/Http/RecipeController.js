
const Recipe = use('App/Models/Recipe');
const Helpers = use('Helpers');
const Drive = use('Drive');
const {
  validateAll,
} = use('Validator');
const Env = use('Env');

const fetch = require('node-fetch');
const targz = require('targz');
const path = require('path');
const fs = require('fs-extra');

const compress = (src, dest) => new Promise((resolve, reject) => {
  targz.compress({
    src,
    dest,
  }, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve(dest);
    }
  });
});

class RecipeController {
  // List official and custom recipes
  async list({
    response,
  }) {
    const officialRecipes = JSON.parse(await (await fetch('https://api.franzinfra.com/v1/recipes')).text());
    const customRecipesArray = (await Recipe.all()).rows;
    const customRecipes = customRecipesArray.map(recipe => ({
      id: recipe.recipeId,
      name: recipe.name,
      ...JSON.parse(recipe.data),
    }));

    const recipes = [
      ...officialRecipes,
      ...customRecipes,
    ];

    return response.send(recipes);
  }

  // Create a new recipe using the new.html page
  async create({
    request,
    response,
  }) {
    // Check if recipe creation is enabled
    if (Env.get('IS_CREATION_ENABLED') == 'false') { // eslint-disable-line eqeqeq
      return response.send('This server doesn\'t allow the creation of new recipes.');
    }

    // Validate user input
    const validation = await validateAll(request.all(), {
      name: 'required|string',
      id: 'required|unique:recipes,recipeId',
      author: 'required|accepted',
      png: 'required|url',
      svg: 'required|url',
    });
    if (validation.fails()) {
      return response.status(401).send({
        message: 'Invalid POST arguments',
        messages: validation.messages(),
        status: 401,
      });
    }

    const data = request.all();

    if (!data.id) {
      return response.send('Please provide an ID');
    }

    // Check for invalid characters
    if (/\.{1,}/.test(data.id) || /\/{1,}/.test(data.id)) {
      return response.send('Invalid recipe name. Your recipe name may not contain "." or "/"');
    }

    // Clear temporary recipe folder
    await fs.emptyDir(Helpers.tmpPath('recipe'));

    // Move uploaded files to temporary path
    const files = request.file('files');
    await files.moveAll(Helpers.tmpPath('recipe'));

    // Compress files to .tar.gz file
    const source = Helpers.tmpPath('recipe');
    const destination = path.join(Helpers.appRoot(), `/recipes/${data.id}.tar.gz`);

    compress(
      source,
      destination,
    );

    // Create recipe in db
    await Recipe.create({
      name: data.name,
      recipeId: data.id,
      data: JSON.stringify({
        author: data.author,
        featured: false,
        version: '1.0.0',
        icons: {
          png: data.png,
          svg: data.svg,
        },
      }),
    });

    return response.send('Created new recipe');
  }

  // Search official and custom recipes
  async search({
    request,
    response,
  }) {
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
      const dbResults = (await Recipe.all()).toJSON();
      results = dbResults.map(recipe => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...JSON.parse(recipe.data),
      }));
    } else {
      let remoteResults = [];
      if (Env.get('CONNECT_WITH_FRANZ') == 'true') { // eslint-disable-line eqeqeq
        remoteResults = JSON.parse(await (await fetch(`https://api.franzinfra.com/v1/recipes/search?needle=${encodeURIComponent(needle)}`)).text());
      }
      const localResultsArray = (await Recipe.query().where('name', 'LIKE', `%${needle}%`).fetch()).toJSON();
      const localResults = localResultsArray.map(recipe => ({
        id: recipe.recipeId,
        name: recipe.name,
        ...JSON.parse(recipe.data),
      }));

      results = [
        ...localResults,
        ...remoteResults || [],
      ];
    }

    return response.send(results);
  }

  // Download a recipe
  async download({
    response,
    params,
  }) {
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

    // Check for invalid characters
    if (/\.{1,}/.test(service) || /\/{1,}/.test(service)) {
      return response.send('Invalid recipe name');
    }

    // Check if recipe exists in recipes folder
    if (await Drive.exists(`${service}.tar.gz`)) {
      return response.send(await Drive.get(`${service}.tar.gz`));
    } if (Env.get('CONNECT_WITH_FRANZ') == 'true') { // eslint-disable-line eqeqeq
      return response.redirect(`https://api.franzinfra.com/v1/recipes/download/${service}`);
    }
    return response.status(400).send({
      message: 'Recipe not found',
      code: 'recipe-not-found',
    });
  }
}

module.exports = RecipeController;
