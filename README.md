<p align="center">
    <a href="https://getferdi.com">
      <img src="./build-helpers/images/icon.png" alt="" width="250"/>
    </a>
</p>
<p align="center">
    <a href="https://getferdi.com/download">
      <img src="./branding/download.png" alt="Download" width="150"/>
    </a>
</p>

# Ferdi

<p align="center">
<img alt="GitHub Releases" src="https://img.shields.io/github/downloads/getferdi/ferdi/latest/total?label=Downloads&logo=iCloud&logoColor=%23FFFFFF">
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href='#contributors-'><img src='https://img.shields.io/badge/contributors-115-default.svg?logo=github' alt='Contributors'/></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<a href="#backers-via-opencollective"><img alt="Open Collective backers" src="https://img.shields.io/opencollective/backers/getferdi?logo=open-collective"></a>
<a href="https://github.com/getferdi/ferdi/actions/workflows/ferdi-builds.yml"><img alt="Build Status" src="https://github.com/getferdi/ferdi/actions/workflows/ferdi-builds.yml/badge.svg?branch=develop&event=push"></a>
<a href="https://gitter.im/getferdi/community"><img alt="Gitter Chat Room" src="https://img.shields.io/gitter/room/getferdi/community"></a>
</p>

🤴🏽 Hard-fork of [Franz](https://github.com/meetfranz/franz), adding awesome features and removing unwanted ones.

## Table of contents

<details>
<summary>Toggle navigation</summary>

- [Ferdi](#ferdi)
  - [Table of contents](#table-of-contents)
  - [What is Ferdi?](#what-is-ferdi)
  - [Features](#features)
  - [What does Ferdi look like?](#what-does-ferdi-look-like)
  - [How to get and start using Ferdi](#how-to-get-and-start-using-ferdi)
    - [Download Ferdi](#download-ferdi)
    - [Or use Chocolatey (Windows only)](#or-use-chocolatey-windows-only)
    - [Or use Windows Package Manager (Windows only)](#or-use-windows-package-manager-windows-only)
    - [Or use homebrew (macOS or Linux)](#or-use-homebrew-macos-or-linux)
    - [Or use snap (Linux only)](#or-use-snap-linux-only)
    - [Or use AUR (Arch Linux)](#or-use-aur-arch-linux)
  - [What makes Ferdi different from Franz?](#what-makes-ferdi-different-from-franz)
    - [Removes unproductive paywalls and other other interruptions](#removes-unproductive-paywalls-and-other-other-interruptions)
    - [Adds features to increase your productivity](#adds-features-to-increase-your-productivity)
    - [Adds features to improve your privacy](#adds-features-to-improve-your-privacy)
    - [Adds features to improve your experience using Ferdi](#adds-features-to-improve-your-experience-using-ferdi)
    - [Fixes bugs](#fixes-bugs)
    - [Adds new platforms](#adds-new-platforms)
    - [Adds internal changes](#adds-internal-changes)
  - [Contributing to Ferdi's development](#contributing-to-ferdis-development)
  - [Nightly releases](#nightly-releases)
  - [Troubleshooting recipes (self-help)](#troubleshooting-recipes-self-help)
  - [Contributors ✨](#contributors-)
  - [Backers via Open Collective](#backers-via-open-collective)
  - [Sponsors](#sponsors)
  </details>

## What is Ferdi?

Ferdi is a desktop app that helps you organize how you use your favourite apps by combining them into one application. It is based on Franz - a software already used by thousands of people - with the difference that Ferdi gives you many additional features and doesn't restrict its usage! Furthermore, Ferdi is compatible with your existing Franz account, so you can continue right where you left off. Please find out more about Ferdi and its features on [getferdi.com](https://getferdi.com).

## Features

- [x] Ferdi puts all your web apps into one place
- [x] Native support for 219 services
- [x] Workspaces to keep your personal and work life separated
- [x] Support for multiple accounts on any service
- [x] Dark Mode support for all of your services
- [x] Optional cloud sync to keep your services synchronized between devices
- [x] Better control over when you get which notifications
- [x] Cross-platform so you can view your services on all your computers
- [x] Full proxy support to work in every network environment
- [x] Ferdi speaks your language: Support for 20+ languages

...and best of all:

- [x] Its completely free! There are no restrictions on features, no paywalls, no ads

## What does Ferdi look like?

<details>
<summary>Toggle screenshots</summary>
<p align="center">
<img alt="Keep all your messaging services in one place." src="./branding/screenshots/hero.png">
<em>"Keep all your messaging services in one place."</em>
<img alt="Order your services with Ferdi Workspaces." src="./branding/screenshots/workspaces.png">
<em>"Order your services with Ferdi Workspaces."</em>
<img alt="Always keep your Todos list open with Ferdi Todos." src="./branding/screenshots/todos.png">
<em>"Always keep your Todos list open with Ferdi Todos."</em>
<img alt="Supporting all your services." src="./branding/screenshots/service-store.png">
<em>"Supporting all your services."</em>
</p>
</details>

## How to get and start using Ferdi

### Download Ferdi

You can download Ferdi for Windows, Mac and Linux on [Ferdi's download page](https://getferdi.com/download) or you can find all variants in the [latest stable release](https://github.com/getferdi/ferdi/releases/latest) assets and [all the other releases here](https://github.com/getferdi/ferdi/releases).

### Or use Chocolatey (Windows only)

`$ choco install ferdi`

(Don't know Chocolatey? [chocolatey.org](https://chocolatey.org/))

### Or use Windows Package Manager (Windows only)

`$ winget install --id AmineMouafik.Ferdi`

(Don't know winget? [winget-cli](https://github.com/microsoft/winget-cli/))

### Or use homebrew (macOS or Linux)

`$ brew install --cask ferdi`

(Don't know homebrew? [brew.sh](https://brew.sh/))

### Or use snap (Linux only)

`$ snap install ferdi`

You can find published releases as `stable`, `beta` and `nightly` channels on [snapcraft.io](https://snapcraft.io/ferdi).

(Don't know snap? [snapcraft.io](https://snapcraft.io/))

### Or use AUR (Arch Linux)

Ferdi has three separate AUR packages you can use:

- **[ferdi](https://aur.archlinux.org/packages/ferdi/)**: Uses your system electron version to run the latest release - this version will work best on most systems.
- **[ferdi-bin](https://aur.archlinux.org/packages/ferdi-bin/)**: Uses the latest Fedora release and extracts it to Arch. Use this version if you are having trouble with the `ferdi` package.
- **[ferdi-git](https://aur.archlinux.org/packages/ferdi-git/)**: Uses your system electron version to run the latest commit from the develop branch and may be unstable but may also give you features that are not yet available in other versions. Please only use `ferdi-git` if you accept these risks.

If you use an AUR Helper, e.g. yay, install it via `yay -S ferdi`.

## What makes Ferdi different from Franz?

### Removes unproductive paywalls and other other interruptions

- [x] Removes the counter-productive fullscreen app delay inviting users to upgrade
- [x] Removes pages begging you to donate after registration
- [x] Removes "Franz is better together" popup
- [x] Makes all users Premium by default ([#15](https://github.com/getferdi/ferdi/issues/15))

### Adds features to increase your productivity

- [x] Adds 30+ new services
- [x] Adds "Find in Page" feature ([#67](https://github.com/getferdi/ferdi/issues/67))
- [x] Adds an option to keep individual workspaces always loaded ([#37](https://github.com/getferdi/ferdi/issues/37))
- [x] Adds "Quick Switch" feature to help you navigate a long list of services (similar to Rambox's [Quick Switcher](https://rambox.pro/#feature-details/quick_switcher))
- [x] Adds "Service Hibernation" that will automatically unload services when they are unused to keep your computer running fast
- [x] Adds a setting to keep service in hibernation after startup ([#577](https://github.com/getferdi/ferdi/issues/577), [#584](https://github.com/getferdi/ferdi/issues/584))
- [x] [Add `user.css` and `user.js` that allows users to inject custom code into services](https://github.com/getferdi/ferdi/wiki/Using-user.css-and-user.js) ([#83](https://github.com/getferdi/ferdi/issues/83))
- [x] Adds Process Manager to find services using a lot of resources
- [x] Adds CTRL+← and CTRL+→ shortcuts and menu options to go back and forward in the service browsing history([#39](https://github.com/getferdi/ferdi/issues/39))
- [x] Adds "Scheduled Do-not-Disturb" feature in which you won't get notifications (similar to Rambox's [Work Hours](https://rambox.pro/#feature-details/work_hours))
- [x] Allows you to [use any Todo service inside "Franz Todo" panel](https://github.com/getferdi/ferdi/wiki/Custom-Todo) (e.g. Todoist via https://todoist.com/app) instead of being limited to using Franz Todo
- [x] Adds a dropdown list to choose your Todo service ([#418](https://github.com/getferdi/ferdi/issues/418), [#477](https://github.com/getferdi/ferdi/issues/477)), 💖 [@yourcontact](https://github.com/yourcontact)
- [x] Differentiates between indirect and direct notifications ([#590](https://github.com/getferdi/ferdi/issues/590)), 💖 [@Room4O4](https://github.com/Room4O4) [@mahadevans87](https://github.com/mahadevans87) [@FeikoJoosten](https://github.com/FeikoJoosten) [@sampathBlam](https://github.com/sampathBlam)

### Adds features to improve your privacy

- [x] [Adds option to change server to a custom](https://github.com/getferdi/ferdi/wiki/Custom-Server) [ferdi-server](https://github.com/getferdi/server)
- [x] Adds option to use Ferdi without an account ([#5](https://github.com/getferdi/ferdi/issues/5))
- [x] Uses the Ferdi API instead of Franz's servers
- [x] Adds "Private Notification"-Mode, that hides message content from notifications ([franz#879](https://github.com/meetfranz/franz/issues/879))
- [x] Adds Password Lock feature to keep your messages protected ([#41](https://github.com/getferdi/ferdi/issues/41), [franz#810](https://github.com/meetfranz/franz/issues/810), [franz#950](https://github.com/meetfranz/franz/issues/950), [franz#1430](https://github.com/meetfranz/franz/issues/1430))
- [x] Adds support for unlocking with Touch ID ([#367](https://github.com/getferdi/ferdi/issues/367))
- [x] Adds inactivity lock that automatically locks Ferdi after a specified amount of time ([#179](https://github.com/getferdi/ferdi/issues/179))
- [x] Adds local [recipe repository](https://github.com/getferdi/recipes) that removes the need of downloading recipes from a remote server

### Adds features to improve your experience using Ferdi

- [x] Adds Universal Dark Mode via the [DarkReader extension](https://github.com/darkreader/darkreader) ([#71](https://github.com/getferdi/ferdi/issues/71))
- [x] Adds Dark Reader settings ([#531](https://github.com/getferdi/ferdi/issues/531), [#568](https://github.com/getferdi/ferdi/issues/568)), 💖 [@Room4O4](https://github.com/Room4O4) & [@mahadevans87](https://github.com/mahadevans87)
- [x] Adds adaptable Dark Mode that will respect the system's Dark Mode setting ([#173](https://github.com/getferdi/ferdi/issues/173), [#548](https://github.com/getferdi/ferdi/issues/548) (💖 [@Room4O4](https://github.com/Room4O4) & [@mahadevans87](https://github.com/mahadevans87)))
- [x] Adds a hotkey to quickly toggle darkmode ([#530](https://github.com/getferdi/ferdi/issues/530), [#537](https://github.com/getferdi/ferdi/issues/537)), 💖 [@Room4O4](https://github.com/Room4O4) & [@mahadevans87](https://github.com/mahadevans87)
- [x] Adds an option to start Ferdi minimized ([#490](https://github.com/getferdi/ferdi/issues/490), [#534](https://github.com/getferdi/ferdi/issues/534))
- [x] Adds ability to change the services icons size and sidebar width ([#153](https://github.com/getferdi/ferdi/issues/153))
- [x] Adds an option to auto-hide the menubar ([#7](https://github.com/getferdi/ferdi/issues/7), [franz#833](https://github.com/meetfranz/franz/issues/833))
- [x] Enhances system tray icon behaviour ([#307](https://github.com/getferdi/ferdi/issues/307))
- [x] Adds option to show draggable window area on macOS ([#304](https://github.com/getferdi/ferdi/issues/304), [#532](https://github.com/getferdi/ferdi/issues/532))
- [x] Adds a notification & audio toggle action to the tray context menu ([#542](https://github.com/getferdi/ferdi/issues/542)), 💖 [@Room4O4](https://github.com/Room4O4) & [@mahadevans87](https://github.com/mahadevans87)
- [x] Adds option to show a browser-like navigation bar on all services
- [x] Adds option to change accent color
- [x] Reflects your currently opened service name to the window title to improve support for Password Managers ([#213](https://github.com/getferdi/ferdi/issues/213)), 💖 [@gmarec](https://github.com/gmarec)
- [x] Allows using SVGs for service custom icon
- [x] Adds button to open darkmode.css for a service
- [x] Improves "About Ferdi" screen to better display versions
- [x] Improves user onboarding ([#493](https://github.com/getferdi/ferdi/issues/493))
- [x] Improves "Updates" section in settings ([#506](https://github.com/getferdi/ferdi/issues/506)), 💖 [@yourcontact](https://github.com/yourcontact)
- [x] Improves draggable window area height for macOS ([#304](https://github.com/getferdi/ferdi/issues/304), [#479](https://github.com/getferdi/ferdi/issues/479))
- [x] Adds option to start Ferdi in system tray ([#331](https://github.com/getferdi/ferdi/issues/331)), 💖 [@jereksel](https://github.com/jereksel)
- [x] Fixes and enhances context menu ([#357](https://github.com/getferdi/ferdi/issues/357) [#413](https://github.com/getferdi/ferdi/issues/413) [#452](https://github.com/getferdi/ferdi/issues/452) [#354](https://github.com/getferdi/ferdi/issues/354) [#227](https://github.com/getferdi/ferdi/issues/227))
- [x] Adds better support for macOS dark mode
- [x] Adds option to disable reload of services after resuming Ferdi ([#442](https://github.com/getferdi/ferdi/issues/442)), 💖 [@n0emis](https://github.com/n0emis)
- [x] Comes with a custom branding proper to Ferdi
- [x] Adds better separation in settings
- [x] Adds various other UI improvements
- [x] Improves documentation of development so more developers can help making Ferdi even better
- [x] Updates Microsoft Teams to allow Desktop Sharing ([getferdi/recipes#116](https://github.com/getferdi/recipes/issues/116)), 💖 [@Gautasmi](https://github.com/Gautasmi)
- [x] Removes automatic reloading from WhatsApp

### Fixes bugs

- [x] Fixes bug that would incorrectly display unread messages count on some services (more info in [7566ccd](https://github.com/getferdi/ferdi/commit/7566ccd))
- [x] Fixes zooming
- [x] Fixes login problems in Google services
- [x] Fixes missing Slack services custom icons ([#290](https://github.com/getferdi/ferdi/issues/290))
- [x] Fixes bug that marked valid domains as invalid ([#276](https://github.com/getferdi/ferdi/issues/276))
- [x] Fixes microphone/camera access on some versions of macOS ([#193](https://github.com/getferdi/ferdi/issues/193))
- [x] Fixes cache clearing not working in Windows 10 ([#541](https://github.com/getferdi/ferdi/issues/541), [#544](https://github.com/getferdi/ferdi/issues/544)), 💖 [@Room4O4](https://github.com/Room4O4) & [@mahadevans87](https://github.com/mahadevans87)
- [x] Fixes Home button in navigation bar not correctly navigating ([#571](https://github.com/getferdi/ferdi/issues/571), [#573](https://github.com/getferdi/ferdi/issues/573)), 💖 [@Room4O4](https://github.com/Room4O4) & [@mahadevans87](https://github.com/mahadevans87)
- [x] Fixes notifications for various services, 💖 [@FeikoJoosten](https://github.com/FeikoJoosten)
- [x] Refocuses Webview only for active service ([#610](https://github.com/getferdi/ferdi/issues/610)), 💖 [@Room4O4](https://github.com/Room4O4) & [@mahadevans87](https://github.com/mahadevans87)

### Adds new platforms

- [x] Adds portable version for Windows so you can use Ferdi without even installing it, 💖 [@Makazzz](https://github.com/Makazzz)
- [x] Adds Arch Linux AUR packages, 💖 [@AGCaesar](https://github.com/AGCaesar)
- [x] Adds Ferdi as a Flatpak on Flathub ([#323](https://github.com/getferdi/ferdi/issues/323)), 💖 [@lhw](https://github.com/lhw)

### Adds internal changes

- [x] Upgrades to Electron 15.3.2
- [x] Switches to [`electron-spellchecker`](https://github.com/electron-userland/electron-spellchecker) to improve application size
- [x] Minifies build files to improve app size
- [x] Adds "npm run prepare-code" command for development to lint and beautify code
- [x] Adds "npm run link-readme" command to automatically add links to issues and users inside README.md
- [x] Fixes incorrect body closing tag ([#330](https://github.com/getferdi/ferdi/issues/330)), 💖 [@jereksel](https://github.com/jereksel)
- [x] Uses CrowdIn to improve i18n
- [x] Adds retry commands to flaky build steps ([#498](https://github.com/getferdi/ferdi/issues/498))
- [x] Runs utility scripts pre-commit instead of pre-push ([#515](https://github.com/getferdi/ferdi/issues/515))

> Thanks to all our [contributors](#contributors-) who helped realize all these amazing features! 💖

## Contributing to Ferdi's development

We welcome all contributors. Please read the [contributing guidelines](CONTRIBUTING.md) to setup your development machine and proceed.

## Nightly releases

Nightly releases are automatically triggered every day ([details](https://github.com/getferdi/ferdi/pull/990)) and available in [getferdi/ferdi](https://github.com/getferdi/ferdi/releases). Maintainers still need to verify and manually publish the draft releases as pre-releases for now.

## Troubleshooting recipes (self-help)

One of the issues being raised by the awesome users of Ferdi is that certain service-functionalities do not work. As good example of this is either the unread count (badge) stops working for specific services or the gmail logins don't work anymore. (These are just 2 of the most common problems reported).

Since we (the contributors to Ferdi) also eat our own dog food, we use Ferdi as our day-to-day communication app - and most likely have faced the same/similar issue. As a first step before filing an issue, we request you to follow these simple steps to see if the issue gets fixed. These recipes will get automatically upgraded when you upgrade to the newer versions of Ferdi, but to get new recipes **between** Ferdi releases, this documentation is quite useful.

- Make sure you are on the latest version of Ferdi. As of this writing, since the nightly CI packaging process is broken, we request you to download the latest nightly from the link in [Nightly releases](#nightly-releases) section.
- Stop Ferdi
- Navigate to the Ferdi profile folder in your respective installation in your file explorer application.

```bash
  Mac: ~/Library/Application Support/Ferdi/recipes
  Windows: %appdata%/Ferdi/recipes
  Linux: ~/.config/Ferdi/recipes
```

- Delete the folder of the service that is causing your issue - _in the file explorer application_. (Please note that if you have manually modified any files here, it will be your responsibility to merge the changes with the latest version of the recipe (or you can submit a [pull request](https://github.com/getferdi/recipes/pulls) for the same).
- Open a browser and navigate to the [recipes](https://github.com/getferdi/recipes/tree/master/recipes) repository page, and copy ALL the files for your erroneous service into your local machine at the location that you deleted in the previous step
- Restart Ferdi (this should upgrade your recipes to the latest working version that the contributors have fixed)
- If this process did not fix the issue, please log a detailed bug report [here](https://github.com/getferdi/recipes/issues)
- _Note:_ An automated process to perform these steps is being ideated and tracked [here](https://github.com/getferdi/ferdi/issues/1302)

## Contributors ✨

Thanks goes to these awesome people:

<a href="https://github.com/getferdi/ferdi/contributors" target="_blank"><img src="https://opencollective.com/getferdi/contributors.svg?width=890&button=off"></a>

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Backers via Open Collective

<a href="https://opencollective.com/getferdi#section-contribute" target="_blank"><img src="https://opencollective.com/getferdi/backers.svg?width=890&button=off"></a>

Mention to the individuals backing us via [GitHub Sponsors](https://github.com/sponsors/getferdi) as well.

## Sponsors

<p>
  <a href="https://www.digitalocean.com/">
    <img src="https://opensource.nyc3.cdn.digitaloceanspaces.com/attribution/assets/SVG/DO_Logo_horizontal_blue.svg" height="32px">
  </a>
</p>
<p>
  <a href="https://www.parallels.com/">
    <img src="https://user-images.githubusercontent.com/412895/141497533-f5e4a0b2-6ffa-4642-aa39-c117f7705780.png" height="32px">
  </a>
</p>
