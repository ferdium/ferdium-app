/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
*/

const { timingSafeEqual } = require('node:crypto');

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

const { API_VERSION } = require('../../environment-remote');
// Run latest database migration
const migrate = require('./migrate');

migrate();

async function validateToken(clientToken, response, next) {
  const serverToken = process.env.FERDIUM_LOCAL_TOKEN;
  const valid =
    serverToken &&
    clientToken &&
    timingSafeEqual(
      Buffer.from(clientToken, 'utf8'),
      Buffer.from(serverToken, 'utf8'),
    );
  if (valid) {
    await next();
    return true;
  }
  return response.forbidden();
}

const OnlyAllowFerdium = async ({ request, response }, next) => {
  const version = request.header('X-Franz-Version');
  if (!version) {
    return response.forbidden();
  }

  const clientToken = request.header('X-Ferdium-Local-Token');
  return validateToken(clientToken, response, next);
};

const RequireTokenInQS = async ({ request, response }, next) => {
  const clientToken = request.get().token;
  return validateToken(clientToken, response, next);
};

const FERDIUM_LOCAL_TOKEN_COOKIE = 'ferdium-local-token';

const RequireAuthenticatedBrowser = async ({ request, response }, next) => {
  const clientToken = request.cookie(FERDIUM_LOCAL_TOKEN_COOKIE);
  return validateToken(clientToken, response, next);
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
  // User authentication
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
})
  .prefix(API_VERSION)
  .middleware(RequireTokenInQS);

Route.group(() => {
  // Franz account import
  Route.post('import', 'UserController.import');
  Route.get('import', ({ view }) => view.render('import'));

  // Account transfer
  Route.get('export', 'UserController.export');
  Route.post('transfer', 'UserController.importFerdium');
  Route.get('transfer', ({ view }) => view.render('transfer'));

  // Index
  Route.get('/', ({ view }) => view.render('index'));
}).middleware(RequireAuthenticatedBrowser);

Route.get('token/:token', ({ params: { token }, response }) => {
  if (validateToken(token)) {
    response.cookie(FERDIUM_LOCAL_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: true,
      path: '/',
    });
    return response.redirect('/');
  }
  return response.forbidden();
});
