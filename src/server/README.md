<p align="center">
    <img src="./logo.png" alt="" width="300"/>  
</p>

# ferdi-internal-server
Internal Ferdi Server used for storing settings without logging into an external server.

## Configuration
franz-server's configuration is saved inside the `env.ini` file. Besides AdonisJS's settings, ferdi-internal-server has the following custom settings:
- `CONNECT_WITH_FRANZ` (`true` or `false`, default: `true`): Whether to enable connections to the Franz server. By enabling this option, ferdi-server can:
  - Show the full Franz recipe library instead of only custom recipes
  - Import Franz accounts

## Importing your Franz account
ferdi-server allows you to import your full Franz account, including all its settings.

To import your Franz account, open `http://localhost:45569/import` in your browser and login using your Franz account details. ferdi-server will create a new user with the same credentials and copy your Franz settings, services and workspaces.
