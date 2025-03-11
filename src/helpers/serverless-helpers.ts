import { LOCAL_SERVER } from '../config';

export default function serverlessLogin(actions) {
  // Use local server for user
  actions.settings.update({
    type: 'app',
    data: {
      server: LOCAL_SERVER,
    },
  });

  // Log into local server
  // Credentials are ignored by the server but the client requires them
  actions.user.login({
    email: 'ferdium@localhost',
    password: 'FERDIUM_',
  });
}
