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

import fold from '@adonisjs/fold';
import { Ignitor } from '@adonisjs/ignitor';
import { existsSync, readFile, statSync, chmodSync, writeFile } from 'fs-extra';
import { join } from 'path';
import { LOCAL_HOSTNAME } from '../config';
import { isWindows } from '../environment';

process.env.ENV_PATH = join(__dirname, 'env.ini');

export const server = async (userPath: string, port: number) => {
  const dbPath = join(userPath, 'server.sqlite');
  const dbTemplatePath = join(__dirname, 'database', 'template.sqlite');

  if (!existsSync(dbPath)) {
    // Manually copy file
    // We can't use copyFile here as it will cause the file to be readonly on Windows
    const dbTemplate = await readFile(dbTemplatePath);
    await writeFile(dbPath, dbTemplate);

    // Change permissions to ensure to file is not read-only
    if (isWindows) {
      // eslint-disable-next-line no-bitwise
      chmodSync(dbPath, statSync(dbPath).mode | 146);
    }
  }

  // Note: These env vars are used by adonis as env vars
  process.env.DB_PATH = dbPath;
  process.env.USER_PATH = userPath;
  process.env.HOST = LOCAL_HOSTNAME;
  process.env.PORT = port.toString();

  new Ignitor(fold).appRoot(__dirname).fireHttpServer().catch(console.error);
};
