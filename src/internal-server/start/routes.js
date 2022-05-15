/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

const { API_VERSION } = require('../../environment-remote');
// Run latest database migration
const migrate = require('./migrate');

migrate();

const OnlyAllowFerdium = async ({ request, response }, next) => {
  const version = request.header('X-Franz-Version');
  if (!version) {
    return response.status(403).redirect('/');
  }

  await next();
  return true;
};

// Health: Returning if all systems function correctly
Route.get('health', ({ response }) =>
  response.send({
    api: 'success',
    db: 'success',
  }),
).middleware(OnlyAllowFerdium);

// API is grouped under '/v1/' route
Route.group(() => {
  // User authentification
  Route.post('auth/signup', 'UserController.signup');
  Route.post('auth/login', 'UserController.login');

  // User info
  Route.get('me', 'UserController.me');
  Route.put('me', 'UserController.updateMe');

  // Service info
  Route.post('service', 'ServiceController.create');
  Route.put('service/reorder', 'ServiceController.reorder');
  Route.put('service/:id', 'ServiceController.edit');
  Route.delete('service/:id', 'ServiceController.delete');
  Route.get('me/services', 'ServiceController.list');

  // Recipe store
  Route.get('recipes', 'RecipeController.list');
  Route.get('recipes/search', 'RecipeController.search');
  Route.get('recipes/popular', 'RecipeController.popularRecipes');
  Route.get('recipes/download/:recipe', 'RecipeController.download');
  Route.post('recipes/update', 'RecipeController.update');

  // Workspaces
  Route.put('workspace/:id', 'WorkspaceController.edit');
  Route.delete('workspace/:id', 'WorkspaceController.delete');
  Route.post('workspace', 'WorkspaceController.create');
  Route.get('workspace', 'WorkspaceController.list');
})
  .prefix(API_VERSION)
  .middleware(OnlyAllowFerdium);

Route.group(() => {
  Route.get('icon/:id', 'ImageController.icon');
}).prefix(API_VERSION);

// Franz account import
Route.post('import', 'UserController.import');
Route.get('import', ({ view }) => view.render('import'));

// Account transfer
Route.get('export', 'UserController.export');
Route.post('transfer', 'UserController.importFerdium');
Route.get('transfer', ({ view }) => view.render('transfer'));

// Index
Route.get('/', ({ view }) => view.render('index'));
