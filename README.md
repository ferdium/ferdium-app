<p align="center">
    <img src="./build-helpers/images/icon.png" alt="" width="200"/>
</p>

# Ferdi

[![Backers on Open Collective](https://opencollective.com/getferdi/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/getferdi/sponsors/badge.svg)](#sponsors) [![Build Status Windows](https://ci.appveyor.com/api/projects/status/2ckfbmoxp36fye5b?svg=true)](https://ci.appveyor.com/project/kytwb/ferdi)
[![Build Status Mac & Linux](https://travis-ci.org/getferdi/ferdi.svg?branch=master)](https://travis-ci.org/getferdi/ferdi)

🤴🏽 Hard-fork of [Franz](https://github.com/meetfranz/franz), adding awesome features and removing unwanted ones.

## Download Ferdi

You can find the installers in the [latest release](https://github.com/getferdi/ferdi/releases) assets.

### Or use homebrew (macOS only)

`$ brew cask install ferdi`

(Don't know homebrew? [brew.sh](https://brew.sh/))

## Ferdi-specific Features

- [x] Removes the counter-productive fullscreen app delay inviting users to upgrade
- [x] Removes pages begging you to donate after registration
- [x] Remove "Franz is better together" popup
- [x] Remove bug that would incorrectly display unread messages count on some services (more info in [7566ccd](https://github.com/getferdi/ferdi/commit/7566ccd))
- [x] Makes all users Premium by default ([#15](https://github.com/getferdi/ferdi/issues/15))
- [x] Using the Ferdi API instead of Franz's servers
- [x] [Add option to change server to a custom](https://github.com/getferdi/ferdi/wiki/Custom-Server) [ferdi-server](https://github.com/getferdi/server)
- [x] Add option to use Ferdi without an account ([#5](https://github.com/getferdi/ferdi/issues/5))
- [x] Add "Private Notification"-Mode, that hides message content from notifications ([franz#879](https://github.com/meetfranz/franz/issues/879))
- [x] Add Password Lock feature to keep your messages protected ([#41](https://github.com/getferdi/ferdi/issues/41), [franz#810](https://github.com/meetfranz/franz/issues/810), [franz#950](https://github.com/meetfranz/franz/issues/950), [franz#1430](https://github.com/meetfranz/franz/issues/1430))
- [x] Add an option to keep individual workspaces always loaded ([#37](https://github.com/getferdi/ferdi/issues/37))
- [x] Add universal Dark-Mode via the [DarkReader extension](https://github.com/darkreader/darkreader) ([#71](https://github.com/getferdi/ferdi/issues/71))
- [x] Add an option to auto-hide the menubar ([#7](https://github.com/getferdi/ferdi/issues/7), [franz#833](https://github.com/meetfranz/franz/issues/833))
- [x] Add "Quick Switch" feature to help you navigate a long list of services (similar to Rambox's [Quick Switcher](https://rambox.pro/#feature-details/quick_switcher))
- [x] Add "Service Hibernation" that will automatically unload services when they are unused
- [x] Add "Scheduled Do-not-Disturb" feature in which you won't get notifications (similar to Rambox's [Work Hours](https://rambox.pro/#feature-details/work_hours))
- [x] Add CTRL+← and CTRL+→ shortcuts and menu options to go back and forward in the service browsing history([#39](https://github.com/getferdi/ferdi/issues/39))
- [x] Add option to show a browser-like navigation bar on all services
- [x] Add option to change accent color
- [x] Add portable version for Windows
- [x] Add Process Manager to find services using a lot of resources
- [x] Add "npm run prepare-code" command for development to lint and beautify code
- [x] Add button to open darkmode.css for a service
- [x] Switch to [`electron-spellchecker`](https://github.com/electron-userland/electron-spellchecker) ti improve application size
- [x] Improve "About Ferdi" screen to better display versions
- [x] Minifying build files to improve app size
- [x] [Makes it possible to edit the "Franz Todo" server](https://github.com/getferdi/ferdi/wiki/Custom-Todo)
- [x] Makes RocketChat self-hosted generally available ([#6](https://github.com/getferdi/ferdi/issues/6))
- [x] Comes with a custom branding proper to Ferdi

## Development

### Preparations

#### Install OS dependencies

##### Node.js

Please make sure you are running NodeJS v10 ([v10.16.3](https://nodejs.org/dist/v10.16.3/) suggested). Versions above will throw an errow when trying to install due to an [old fsevent dependency](https://github.com/fsevents/fsevents/issues/278).

##### Git

The version [2.23.0](https://github.com/git-for-windows/git/releases/tag/v2.23.0.windows.1) for Git is working fine for development. You can then use the console from Git to do the development procedure.

##### Debian/Ubuntu

```bash
$ apt install libx11-dev libxext-dev libxss-dev libxkbfile-dev
```

##### Fedora

```bash
$ dnf install libX11-devel libXext-devel libXScrnSaver-devel libxkbfile-devel
```

##### Windows

```bash
$ npm install --global windows-build-tools // Windows 10
$ npm install --global windows-build-tools --vs2015 // Windows 7
```

#### Clone repository with submodule

```bash
$ git clone https://github.com/getferdi/ferdi.git
$ cd ferdi
$ git submodule update --init --recursive
```

It is important you execute the last command to get the required submodules (recipes, server).

### Install dependencies

Run the following command to install all dependencies, and link sibling modules with Ferdi.

```bash
$ npx lerna bootstrap
```

If you previously ran `npm install` it sometimes is necessary to delete your `node_modules` folder before running `npx lerna bootstrap`.

### Fix native modules to match current electron node version

```bash
$ npm run rebuild
```

### Start development app

Run these two commands **simultaneously** in different console tabs:

```bash
$ npm run dev
$ npm run start
```

Be aware that the development database will be reset regularly.

### Packaging

```bash
$ npm run build
```

Deliverables will be available in the `out` folder.

### Release

```bash
$ git checkout develop && git pull && git checkout master
$ git merge --no-ff develop
$ git tag v5.3.4-beta.4
$ git push --tags
```

When pushing a new tag, the CI builds will create a draft GitHub release and upload the deliverables in the draft release assets. Wait for all the assets to be uploaded before publishing the draft release.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://vantezzen.io"><img src="https://avatars2.githubusercontent.com/u/10333196?v=4" width="40px;" alt="Bennett"/><br /><sub><b>Bennett</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/commits?author=vantezzen" title="Code">💻</a> <a href="#design-vantezzen" title="Design">🎨</a> <a href="https://github.com/kytwb/ferdi/commits?author=vantezzen" title="Documentation">📖</a> <a href="#ideas-vantezzen" title="Ideas, Planning, & Feedback">🤔</a> <a href="#translation-vantezzen" title="Translation">🌍</a> <a href="#example-vantezzen" title="Examples">💡</a> <a href="https://github.com/kytwb/ferdi/issues?q=author%3Avantezzen" title="Bug reports">🐛</a> <a href="#content-vantezzen" title="Content">🖋</a> <a href="#infra-vantezzen" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#userTesting-vantezzen" title="User Testing">📓</a> <a href="#question-vantezzen" title="Answering Questions">💬</a> <a href="#projectManagement-vantezzen" title="Project Management">📆</a> <a href="#review-vantezzen" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="http://www.adlk.io"><img src="https://avatars1.githubusercontent.com/u/3265004?v=4" width="40px;" alt="Stefan Malzner"/><br /><sub><b>Stefan Malzner</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/commits?author=adlk" title="Code">💻</a> <a href="#content-adlk" title="Content">🖋</a> <a href="#design-adlk" title="Design">🎨</a> <a href="https://github.com/kytwb/ferdi/commits?author=adlk" title="Documentation">📖</a> <a href="#ideas-adlk" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-adlk" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#projectManagement-adlk" title="Project Management">📆</a> <a href="https://github.com/kytwb/ferdi/commits?author=adlk" title="Tests">⚠️</a> <a href="#translation-adlk" title="Translation">🌍</a></td>
    <td align="center"><a href="https://twitter.com/kytwb"><img src="https://avatars0.githubusercontent.com/u/412895?v=4" width="40px;" alt="Amine Mouafik"/><br /><sub><b>Amine Mouafik</b></sub></a><br /><a href="#question-kytwb" title="Answering Questions">💬</a> <a href="https://github.com/kytwb/ferdi/commits?author=kytwb" title="Code">💻</a> <a href="https://github.com/kytwb/ferdi/commits?author=kytwb" title="Documentation">📖</a> <a href="#ideas-kytwb" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-kytwb" title="Maintenance">🚧</a> <a href="#platform-kytwb" title="Packaging/porting to new platform">📦</a> <a href="#projectManagement-kytwb" title="Project Management">📆</a> <a href="#review-kytwb" title="Reviewed Pull Requests">👀</a> <a href="#infra-kytwb" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#fundingFinding-kytwb" title="Funding Finding">🔍</a></td>
    <td align="center"><a href="http://seriesgt.com"><img src="https://avatars3.githubusercontent.com/u/5977640?v=4" width="40px;" alt="ZeroCool"/><br /><sub><b>ZeroCool</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/commits?author=ZeroCool940711" title="Code">💻</a> <a href="#ideas-ZeroCool940711" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/rseitbekov"><img src="https://avatars2.githubusercontent.com/u/35684439?v=4" width="40px;" alt="rseitbekov"/><br /><sub><b>rseitbekov</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/commits?author=rseitbekov" title="Code">💻</a></td>
    <td align="center"><a href="https://djangogigs.com/developers/peter-bittner/"><img src="https://avatars2.githubusercontent.com/u/665072?v=4" width="40px;" alt="Peter Bittner"/><br /><sub><b>Peter Bittner</b></sub></a><br /><a href="#ideas-bittner" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/kytwb/ferdi/issues?q=author%3Abittner" title="Bug reports">🐛</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/justus-saul"><img src="https://avatars1.githubusercontent.com/u/5861826?v=4" width="40px;" alt="Justus Saul"/><br /><sub><b>Justus Saul</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/issues?q=author%3Ajustus-saul" title="Bug reports">🐛</a> <a href="#ideas-justus-saul" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/igreil"><img src="https://avatars0.githubusercontent.com/u/17239151?v=4" width="40px;" alt="igreil"/><br /><sub><b>igreil</b></sub></a><br /><a href="#ideas-igreil" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://marcolopes.eu"><img src="https://avatars1.githubusercontent.com/u/431889?v=4" width="40px;" alt="Marco Lopes"/><br /><sub><b>Marco Lopes</b></sub></a><br /><a href="#ideas-marcolopes" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/dayzlun"><img src="https://avatars3.githubusercontent.com/u/17259690?v=4" width="40px;" alt="dayzlun"/><br /><sub><b>dayzlun</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/issues?q=author%3Adayzlun" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://twitter.com/tobigue_"><img src="https://avatars2.githubusercontent.com/u/1560152?v=4" width="40px;" alt="Tobias Günther"/><br /><sub><b>Tobias Günther</b></sub></a><br /><a href="#ideas-tobigue" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/AGCaesar"><img src="https://avatars3.githubusercontent.com/u/7844066?v=4" width="40px;" alt="AGCaesar"/><br /><sub><b>AGCaesar</b></sub></a><br /><a href="#platform-AGCaesar" title="Packaging/porting to new platform">📦</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Makazzz"><img src="https://avatars2.githubusercontent.com/u/49844464?v=4" width="40px;" alt="Makazzz"/><br /><sub><b>Makazzz</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/issues?q=author%3AMakazzz" title="Bug reports">🐛</a> <a href="https://github.com/kytwb/ferdi/commits?author=Makazzz" title="Code">💻</a> <a href="#translation-Makazzz" title="Translation">🌍</a></td>
    <td align="center"><a href="https://github.com/xthursdayx"><img src="https://avatars0.githubusercontent.com/u/18044308?v=4" width="40px;" alt="xthursdayx"/><br /><sub><b>xthursdayx</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/commits?author=xthursdayx" title="Code">💻</a> <a href="https://github.com/kytwb/ferdi/commits?author=xthursdayx" title="Documentation">📖</a> <a href="#infra-xthursdayx" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#platform-xthursdayx" title="Packaging/porting to new platform">📦</a></td>
    <td align="center"><a href="https://github.com/Gaboris"><img src="https://avatars2.githubusercontent.com/u/9462372?v=4" width="40px;" alt="Gaboris"/><br /><sub><b>Gaboris</b></sub></a><br /><a href="#question-Gaboris" title="Answering Questions">💬</a> <a href="https://github.com/kytwb/ferdi/issues?q=author%3AGaboris" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.cu3ed.com/"><img src="https://avatars1.githubusercontent.com/u/61343?v=4" width="40px;" alt="Ce"/><br /><sub><b>Ce</b></sub></a><br /><a href="https://github.com/kytwb/ferdi/issues?q=author%3Aincace" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Backers via OpenCollective

<a href="https://opencollective.com/getferdi#backers" target="_blank"><img src="https://opencollective.com/getferdi/backers.svg?width=890"></a>
