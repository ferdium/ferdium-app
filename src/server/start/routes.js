
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');
const Env = use('Env');

const OnlyAllowFerdi = async ({ request, response }, next) => {
  const user = request.header('User-Agent');
  if (!/Ferdi\/\d(\.\d){2}/g.test(user)) {
    return response.status(403).redirect('/');
  }

  await next()
};

// Health: Returning if all systems function correctly
Route.get('health', ({
  response,
}) => response.send({
  api: 'success',
  db: 'success',
})).middleware(OnlyAllowFerdi);

// API is grouped under '/v1/' route
Route.group(() => {
  // User authentification
  Route.post('auth/signup', 'UserController.signup');
  Route.post('auth/login', 'UserController.login');

  // User info
  Route.get('me', 'UserController.me');

  // Service info
  Route.post('service', 'ServiceController.create');
  Route.put('service/:id', 'ServiceController.edit');
  Route.delete('service/:id', 'ServiceController.delete');
  Route.get('me/services', 'ServiceController.list');
  Route.put('service/reorder', 'ServiceController.reorder');
  Route.get('recipe', 'ServiceController.list');
  Route.post('recipes/update', 'ServiceController.update');

  // Recipe store
  Route.get('recipes', 'RecipeController.list');
  Route.get('recipes/download/:recipe', 'RecipeController.download');
  Route.get('recipes/search', 'RecipeController.search');
  Route.get('recipes/popular', 'StaticController.popularRecipes');
  Route.get('recipes/update', 'StaticController.emptyArray');

  // Workspaces
  Route.put('workspace/:id', 'WorkspaceController.edit');
  Route.delete('workspace/:id', 'WorkspaceController.delete');
  Route.post('workspace', 'WorkspaceController.create');
  Route.get('workspace', 'WorkspaceController.list');

  // Static responses
  Route.get('features', 'StaticController.features');
  Route.get('services', 'StaticController.emptyArray');
  Route.get('news', 'StaticController.emptyArray');
  Route.get('payment/plans', 'StaticController.plans');
  Route.get('announcements/:version', 'StaticController.announcement');
}).prefix('v1').middleware(OnlyAllowFerdi);

// Franz account import
Route.post('import', 'UserController.import');
Route.get('import', ({ view }) => view.render('import'));

// Index
Route.get('/', ({ view }) => view.render('index'));
