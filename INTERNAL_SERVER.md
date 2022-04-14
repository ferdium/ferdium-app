<p align="center">
    <img src="./src/internal-server/public/images/logo.png" alt="" width="300"/>
</p>

# ferdium-internal-server
Internal ferdium Server used for storing settings/preferences without logging into an external server.

## Differences to ferdium-server
- Doesn't contain user management (only one user)
- Doesn't require logging in
- No recipe creation
- Contains `start.js` script to allow starting the server via script
- Uses `env.ini` instead of `.env` to stay compatible with ferdium's build script
- Only allows ferdium clients to connect to the API

## Configuration
franz-server's configuration is saved inside the `env.ini` file. Besides AdonisJS's settings, `ferdium-internal-server` has the following custom settings:
- `CONNECT_WITH_FRANZ` (`true` or `false`, default: `true`): Whether to enable connections to the Franz server. By enabling this option, ferdium-internal-server can:
  - Show the full Franz recipe library instead of only custom recipes
  - Import Franz accounts

## Importing your Franz account
`ferdium-internal-server` allows you to import your full Franz account, including all its settings.

To import your Franz account, open `http://localhost:45569/import` in your browser and login using your Franz account details. `ferdium-internal-server` will create a new user with the same credentials and copy your Franz settings, services and workspaces.

## Development

You can locally develop `ferdium-internal-server` outside of ferdium.

1. Start the local server via
  ```bash
  npm run start:server
  ```
2. Change ferdium's server to `http://localhost:45568` to start using the local test server.

## Note For previous contributors
For anyone who has *previously* setup ferdium for development, you will need to unregister the `src/internal-server` from being a git submodule. You can do this by following the steps outlined [here](https://www.w3docs.com/snippets/git/how-to-remove-a-git-submodule.html)
