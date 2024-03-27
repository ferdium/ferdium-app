# [v6.2.0](https://github.com/ferdium/ferdium-app/compare/v6.1.0...v6.2.0) (2022-09-22)

### :warning: BREAKING CHANGES :warning:

- Added feature to set how Ferdium handles WebRTC IP Exposure (under `Settings` > `Privacy`)
  - Services that depend on RTC can be affected by this change (eg. Discord). Please see @SpecialAro comment on the issue [#611](https://github.com/ferdium/ferdium-app/issues/611) to see a way to fix it.

### Features

- Added Latvian in the list of supported languages.
- New Crowdin translation updates (Portuguese, French, German, Polish, Portuguese Brazilian, Japanese, Hebrew, Latvian)


### Services
- Added Magic Level recipe 
- Added Mailfence recipe
- Added Odysee recipe
- Added OnMail recipe
- Updated Proton Mail icon
- Fixed Ferdium theme warning hijacking popups on WhatsApp


### Bug fixes


### Under the hood

- Upgrade `electron` to `20.2.0`
- Upgrade `electron-builder` to `23.5.1`
- Upgrade `nodejs` to `16.17.0`
- Upgrade `electron` to `20.1.2`

# [v6.1.0](https://github.com/ferdium/ferdium-app/compare/v6.0.1-nightly.23...v6.1.0) (2022-08-27)

### Features

- Added native Ferdium Translator.
- Added language support for Vietnamese, Arabic, Finnish, Hebrew, Korean, Norwegian, Romanian, Sinhala and Swedish. Note that the percentage of each translation can be found in: https://crowdin.com/project/ferdium-app
- New translation updates (Crowdin)

### Services
- Added Grammarly recipe
- Added warning to whatsapp theming
- Added Tick recipe 

### Bug fixes

- Fix purple screen when trying to run a second instance of Ferdium
- Fix for Windows not detecting Ferdium window after maximized with the tray icon
- Fix for app dark mode handler replacing the dark mode recipe setting
- Fix Toggle Full Screen not working on Menu bar

### Under the hood

- Add mailto to email in md files
- Upgrade `electron` to `20.1.0`
- docs: Update README badges
- ci/cd: Make winget workflow ready for production
- Update Ferdi/Ferdium names in Migration guide
- Upgrade `npm` to `8.14.0`
- Upgrade `nodejs` to `16.16.0`
- Replace deprecated `react-addons-css-transition-group` with `react-transition-group`
- chore: change values with mobx actions
- Upgrade `electron-builder` to `23.3.3`
- Fix bad conversion to action of reaction `_setLocale()`
- Fix pnpm run create directions on recipes

# [v6.0.0](https://github.com/ferdium/ferdium-app/compare/v6.0.0-nightly.97...v6.0.0) (2022-07-21)

### Features

- Handle both ferdi and ferdium servers for transferring from
- Refactor the 'Welcome' screen and the 'SetupAssistant' for better UX
- Create winget updater GH workflow (#484)
- Feature: Add Release Notes
- Add 'Services' tab to settings

### Services

### Bug fixes

- Fix icons misalignment in horizontal mode
- horizontal sidebar style on macOS
- enable/disable todos menu
- remove autoHibernate
- draggable area on fullscreen (macOS)

### Under the hood

- Added more badges into 'README.md`
- Fix prepare-code script
- use global crowdin link and lint fixes
- Use defaults defined in one place instead of hardcoding in multiple places

# [v6.0.0-beta.3](https://github.com/ferdium/ferdium-app/compare/v6.0.0-nightly.77...v6.0.0-nightly.97) (2022-07-12)

### Features

- Bring the draggable area back on MacOS
- Remember collapsed state of hamburger menu on refresh/reboot
- Add NSIS and portable arm64 builds for Windows OS
- Copy Ferdium info from the `About` dialog into the clipboard
- Change names of released artifacts for better intuitive experience of first time users
- Add Server Information to About Dialog and to Global Messages
- Add hint text to go back to welcome screen from the login screen
- Remove `msi` builds on windows and build separate windows installers for all archs
- Allow selecting help text (eg the `user-agent` helper urls)

### Services

- New recipe: `protondrive`
- New recipe: `pushover`
- Switch from counting of space-badges to room tile badges for Element
- Fix syntax errors in nextcloud recipes
- Hide `install messenger` button
- Workaround for Whatsapp Web UI lag
- New recipe: `trakt.tv`
- New recipe: `Zammad`
- Fix outlook issue by changing the service URL
- New recipe: `Tiktok`
- New recipe: `GamingOnLinux`
- Allow self-hosted option for `bitbucket`
- Fix in app URLs for `discord`
- Fix indirect notification count in `github`
- New recipe: `kiwiIRC`
- Fix issue with `telegram` web-k not being recognized correctly
- Fix `facebook` notifications counter

### Bug fixes

- Reduce tab item layout shift
- Disable API Server recipes updates
- Fix Cache Settings subsection styling
- Fix toggle for pre-release updates on Ubuntu
- Fix crowdin link on app
- Disable symlinks to build_id for rpm
- Fix bug of TODO settings not being shown when a TODO Recipe is present
- Add file size info and error message while setting a custom image in the recipe settings screen
- Use the default accent color if the user removes value from textbox
- Fix Menu bar on Windows not being clickable
- Fix local server import/export
- Fix blank screen after in-app update on Windows
- Fix Windows 11 Platform message

### Under the hood

- chore: moved tests to ./test directory
- Add documentation about exporting settings when using the internal server [skip ci]
- Converted portions of the javascript code into typescript
- Move the `MIGRATION.md` documentation from another repo [skip ci]
- recommend specific vscode extensions to setup development [skip ci]
- Change allowed version for MSVS on Windows build script [skip ci]
- Checks if MSVS 2019 or 2022 exists through reg key [skip ci]
- Mobx & React-Router upgrade
- Upgrade `npm` to `8.13.2` and `pnpm` to `7.4.1`
- Upgrade `electron-updater` to `5.1.0`
- Upgrade `electron` to `19.0.8`
- Upgrade `moment` to fix dependabot warning
- Upgrade `macos-notification-state` to `2.0.1`
- Upgrade `pnpm` to `7.5.0`
- Upgrade `electron-builder` to `23.3.1`

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
- Workaround for in-app Password Recovery
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
- Add new service-level option where the user can choose whether to open links in Ferdium or in the default browser. Currently implemented only for discord, skype, steamchat and zoom.

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
