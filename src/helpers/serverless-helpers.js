export default function useLocalServer(actions) {
  // Use local server for user
  actions.settings.update({
    type: 'app',
    data: {
      server: 'http://localhost:45569',
    },
  });

  // Log into local server
  // Credentials are ignored by the server but the client requires them
  actions.user.login({
    email: 'ferdi@localhost',
    password: 'FERDI_',
  });
}
