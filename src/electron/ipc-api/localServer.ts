import { randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import { type BrowserWindow, ipcMain } from 'electron';
import { LOCAL_HOSTNAME, LOCAL_PORT } from '../../config';
import { userDataPath } from '../../environment-remote';
import { server } from '../../internal-server/start';

const debug = require('../../preload-safe-debug')('Ferdium:LocalServer');

const portInUse = (port: number): Promise<boolean> =>
  new Promise(resolve => {
    const server = createServer(socket => {
      socket.write('Echo server\r\n');
      socket.pipe(socket);
    });

    server.listen(port, LOCAL_HOSTNAME);
    server.on('error', () => {
      resolve(true);
    });
    server.on('listening', () => {
      server.close();
      resolve(false);
    });
  });

let localServerStarted = false;
let port = LOCAL_PORT;
let token = '';

export default (params: { mainWindow: BrowserWindow }) => {
  ipcMain.on('startLocalServer', () => {
    (async () => {
      if (!localServerStarted) {
        // Find next unused port for server
        port = LOCAL_PORT;
        // eslint-disable-next-line no-await-in-loop
        while ((await portInUse(port)) && port < LOCAL_PORT + 10) {
          port += 1;
        }
        token = randomBytes(256 / 8).toString('base64url');
        debug(
          'Starting local server at',
          `http://localhost:${port}/token/${token}`,
        );
        await server(userDataPath(), port, token);
        localServerStarted = true;
      }

      // Send local server parameters to the renderer even if the server is already running.
      params.mainWindow.webContents.send('localServerPort', {
        port,
        token,
      });
    })().catch(error => {
      console.error('Error while starting local server', error);
    });
  });
};
