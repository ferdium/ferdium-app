# [v6.0.0-beta.2](https://github.com/ferdium/ferdium-app/compare/v6.0.0-nightly.47...v6.0.0-nightly.77) (2022-06-25)

### Features

- Add ability to navigate recipe with mouse buttons
- Add audio-record plug to snap build
- Add removable-media snap interface
- Add color picker component for accent color setting
- Add 'Google Keep' as another option in Ferdium TODOs
- Add progress indicator on top of the Ferdium window for page loading. The color of the progressbar can be set globally, and it can be enabled/disabled per-service
- Add `startpage.com` as option search-engine and make it the default for new users
- Remove Ferdi Server from available Servers List
- Add Toggle Navbar to View Menu (global)
- Change 'Most Popular' list in Services to 'Ferdium Picks'
- Change login screen layout
- Disable TODOs feature by default
- Add split mode toggle to side bar, View menu and hide/collapse button
- Improve TODO menu behaviour on fresh install

### Services

### Bug fixes

- Fix hero image (was referring to ferdi repo)
- Fix blank window appearing on startup
- Fix service labels cut off when using Slim Sidebar
- Fix broken faq url
- Fix for Developer Tools not showing up via menu
- Move location of 'Change server' link on main screen for better visibility
- Fix default accent color to Ferdium gradient
- Fix reload after resume and add idle time setting
- Don't replace custom icon when service updates
- Workaroud for in-app Password Recovery
- Fix navigation toolbar buttons not being clickable
- Fix drag-n-drop not working if the service name is shown
- Fix ribbon menu style on windows

### Under the hood

- Expose a new utility method 'Ferdium.isImage' for use by recipes
- Align 'Save service' button to right when adding recipe
- Change Input box to slider on Grayscale dim level
- Upgrade `electron` to the latest public version (`19.0.6`) to bring in lots of security fixes
- Upgrade `node` to `16.15.1`, `npm` to `8.12.2` and `pnpm` to `7.3.0`
- Upgrade `electron-builder` to `23.2.0` and `electron-updater` to `5.0.6`
- Enable AutoUpdates from in-app with code-signing certificates on macOS and windows
- Remove integration with sentry
- Update CONTRIBUTING.md for new contributors' dev machine setup
- Lock snapcraft to v5 since v7 breaks the build
- Add GH workflows to publish on nightly, beta and release builds for homebrew casks and reddit
- Remove DevContainer from project

# [v6.0.0-beta.1](https://github.com/ferdium/ferdium-app/compare/v5.8.2-nightly.2...v6.0.0-nightly.47) (2022-05-26)

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

- Upgrade `electron` to the latest public version (18.3.1) to bring in lots of security fixes
- Remove explicit dependency on `node-gyp` so as to minimize issues for compilation across different OSes and versions
- Turn off signing of mac and windows artifacts till we acquire the licenses
- Add build scripts for linux, macos and windows to help new contributors get Ferdium setup quickly for local development
- Convert some javascript files to typescript
- Start adding some unit tests (still a long way to go for decent coverage)
- Upgrade system dependencies and node modules to newer versions
- Update list of contributors in all repositories
