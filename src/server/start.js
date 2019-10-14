
/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstraps Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass a relative path from the project root.
*/
const path = require('path');
const fs = require('fs-extra');
// eslint-disable-next-line import/no-extraneous-dependencies
const { app } = require('electron');

process.env.ENV_PATH = path.join(__dirname, 'env.ini');

// Make sure local database exists
const dbPath = path.join(app.getPath('userData'), 'server.sqlite');
if (!fs.existsSync(dbPath)) {
  fs.copySync(
    path.join(__dirname, 'database', 'template.sqlite'),
    dbPath,
  );
}

const { Ignitor } = require('@adonisjs/ignitor');
const fold = require('@adonisjs/fold');

new Ignitor(fold)
  .appRoot(__dirname)
  .fireHttpServer()
  .catch(console.error); // eslint-disable-line no-console
