# [v6.0.0-beta.1](https://github.com/ferdium/ferdium-app/compare/v5.8.2-nightly.2...v6.0.0-nightly.44) (2022-05-23)

### Features
- Rebrand from Ferdi to Ferdium (text and visuals)
- [New website](https://ferdium.org/) is up and running!
- Ferdium server is also available for those who want to self-host
- Ferdium server also shows up as an option for those who want to move away from the publicly-hosted Ferdi server
- Add scripts/documentation to help users migrate from Ferdi to Ferdium (not automated due to the various combinations possible) - both hosted-server as well as serverless modes
- Use a different port number for the internal server (used in accountless mode) so that it doesn't clash if a user wants to run Ferdi and Ferdium simultaneously
- Resurrect the electron-process-manager for Ferdium
- Hide sidebar buttons toggled behind a hamburger menu
- Add monochromatic Service icons option with Dim adjustment
- Add new service-level option where the user can choose whether to open links in Ferdium or in the default browser. Currently implimented only for discord, skype, steamchat and zoom.

### Services

- Fix unread count for msteams service
- Improve view width on Telegram 'K' version
- Fix LinkedIn dark mode
- Don't count muted chats, remove defunct workarounds in FB Messenger
- Add Gitea recipe
- Fix unread message counts for zulip, groupme and hostnet recipes
- Add support for self-hosted github url

### Bug fixes

- Fix height of tab items in relation to width for Normal Sidebar
- Fix issue where the password got reset if any other setting was changed
- Increase the vertical height of the draggable area to center the 3 OS titlebar-buttons

### Under the hood

- Upgrade `electron` to the latest public version (18.2.4) to bring in lots of security fixes
- Remove explicit dependency on `node-gyp` so as to minimize issues for compilation across different OSes and versions
- Turn off signing of mac and windows artifacts till we acquire the licenses
- Add build scripts for linux, macos and windows to help new contributors get Ferdium setup quickly for local development
- Convert some javascript files to typescript
- Start adding some unit tests (still a long way to go for decent coverage)
- Upgrade system dependencies and node modules to newer versions
- Update list of contributors in all repositories
