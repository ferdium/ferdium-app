
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

process.env.ENV_PATH = path.join(__dirname, 'env.ini');

const { Ignitor } = require('@adonisjs/ignitor');
const fold = require('@adonisjs/fold');

module.exports = (dbPath, port) => {
  if (!fs.existsSync(dbPath)) {
    fs.copySync(
      path.join(__dirname, 'database', 'template.sqlite'),
      dbPath,
    );
  }

  process.env.DB_PATH = dbPath;
  process.env.PORT = port;

  new Ignitor(fold)
    .appRoot(__dirname)
    .fireHttpServer()
    .catch(console.error); // eslint-disable-line no-console
};
