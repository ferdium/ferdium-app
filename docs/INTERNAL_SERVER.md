<p align="center">
    <img src="../src/internal-server/public/images/logo.png" alt="" width="300"/>
</p>

# ferdium-internal-server
Internal Ferdium Server used for storing settings/preferences without logging into an external server.

## Differences to ferdium-server
- Doesn't contain user management (only one user)
- Doesn't require logging in
- No recipe creation
- Contains `start.js` script to allow starting the server via script
- Uses `env.ini` instead of `.env` to stay compatible with Ferdium's build script
- Only allows Ferdium clients to connect to the API

## Configuration
`ferdium-internal-server's` configuration is saved inside the `env.ini` file. Besides AdonisJS's settings, `ferdium-internal-server` has the following custom settings:
- `CONNECT_WITH_FRANZ` (`true` or `false`, default: `true`): Whether to enable connections to the Franz server. By enabling this option, `ferdium-internal-server` can:
  - Show the full Franz/Ferdi recipe library instead of only custom recipes
  - Import Franz/Ferdi accounts

## Exporting backups
Since the `ferdium-internal-server` runs a local server, there's no automatic syncing of settings possible. You can backup your settings, by clicking on `Help > Import/Export Configuration Data` which will open the running server page in your browser. Choose the option to export and save the generated file.

## Importing your Franz/Ferdi account
`ferdium-internal-server` allows you to import your full Franz account, including all its settings.

To import your Franz/Ferdi account, within Ferdium, click on `Help > Import/Export Configuration Data` which will open the running server page in your browser. You can then login using your Franz account details. `ferdium-internal-server` will create a new user with the same credentials and copy your Franz settings, services and workspaces.
