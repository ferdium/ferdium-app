<p align="center">
    <img src="./logo.png" alt="" width="300"/>  
</p>

# ferdi-internal-server
Internal Ferdi Server used for storing settings without logging into an external server.

npm i @adonisjs/ace @adonisjs/auth @adonisjs/bodyparser @adonisjs/cors @adonisjs/drive @adonisjs/fold @adonisjs/framework @adonisjs/ignitor @adonisjs/lucid @adonisjs/session @adonisjs/shield @adonisjs/validator atob btoa fs-extra  node-fetch sqlite3 uuid targz

### Manual setup
1. Clone this repository
2. Install the [AdonisJS CLI](https://adonisjs.com/)
3. Run the database migrations with
    ```js
    adonis migration:run
    ```
4. Start the server with
    ```js
    adonis serve --dev
    ```

## Configuration
franz-server's configuration is saved inside the `.env` file. Besides AdonisJS's settings, ferdi-server has the following custom settings:
- `IS_CREATION_ENABLED` (`true` or `false`, default: `true`): Whether to enable the [creation of custom recipes](#creating-and-using-custom-recipes)
- `CONNECT_WITH_FRANZ` (`true` or `false`, default: `true`): Whether to enable connections to the Franz server. By enabling this option, ferdi-server can:
  - Show the full Franz recipe library instead of only custom recipes
  - Import Franz accounts

## Importing your Franz account
ferdi-server allows you to import your full Franz account, including all its settings.

To import your Franz account, open `http://localhost:45569/import` in your browser and login using your Franz account details. ferdi-server will create a new user with the same credentials and copy your Franz settings, services and workspaces.

## Creating and using custom recipes
ferdi-server allows to extends the Franz recipe catalogue with custom Ferdi recipes.

For documentation on how to create a recipe, please visit [the official guide by Franz](https://github.com/meetfranz/plugins/blob/master/docs/integration.md).

To add your recipe to ferdi-server, open `http://localhost:45569/new` in your browser. You can now define the following settings:
- `Author`: Author who created the recipe
- `Name`: Name for your new service. Can contain spaces and unicode characters
- `Service ID`: Unique ID for this recipe. Does not contain spaces or special characters (e.g. `google-drive`)
- `Link to PNG/SVG image`: Direct link to a 1024x1024 PNG image and SVG that is used as a logo inside the store. Please use jsDelivr when using a file uploaded to GitHub as raw.githubusercontent files won't load
- `Recipe files`: Recipe files that you created using the [Franz recipe creation guide](https://github.com/meetfranz/plugins/blob/master/docs/integration.md). Please do *not* package your files beforehand - upload the raw files (you can drag and drop multiple files). ferdi-server will automatically package and store the recipe in the right format. Please also do not drag and drop or select the whole folder, select the individual files.

### Listing custom recipes
Inside Ferdi, searching for `ferdi:custom` will list all your custom recipes.

## License
ferdi-server is licensed under the MIT License
