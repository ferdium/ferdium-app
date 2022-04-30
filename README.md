<p align="center">
    <a href="https://ferdium.org">
      <img src="./build-helpers/images/icon.png" alt="" width="250"/>
    </a>
</p>
<p align="center">
    <a href="https://ferdium.org/download">
      <img src="./branding/download.png" alt="Download" width="150"/>
    </a>
</p>

# Ferdium

- [Ferdium](#ferdium)
  - [Screenshots](#screenshots)
  - [Download](#download)
  - [Unsigned Nightlies on MacOS](#unsigned-nightlies-on-macos)
  - [Migrating from Ferdi](#migrating-from-ferdi)
  - [Contributing](#contributing)

[![Builds](https://github.com/ferdium/ferdium-app/actions/workflows/builds.yml/badge.svg)](https://github.com/ferdium/ferdium-app/actions/workflows/builds.yml)
<!-- TODO: Uncomment once we have integrated with crowdin
<a title="Crowdin" target="_blank" href="https://crowdin.com/project/ferdium"><img src="https://badges.crowdin.net/ferdium/localized.svg"></a>
-->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href='#contributors-'><img src='https://img.shields.io/badge/contributors-257-default.svg?logo=github' alt='Contributors'/></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->

> 🤴🏽 Hard-fork of [Franz](https://github.com/meetfranz/franz), adding awesome features and removing unwanted ones.

Ferdium is a desktop app that helps you organize how you use your favourite apps by combining them into one application. It is based on Franz - a software already used by thousands of people - with the difference that Ferdium gives you many additional features and doesn't restrict its usage! Furthermore, Ferdium is compatible with your existing Franz account, so you can continue right where you left off. Please find out more about Ferdium and its features on [ferdium.org](https://ferdium.org).

## Screenshots

<details>
<summary>Toggle screenshots</summary>
<p align="center">
<img alt="Keep all your messaging services in one place." src="./branding/screenshots/hero.png">
<em>"Keep all your messaging services in one place."</em>
<img alt="Order your services with Ferdium Workspaces." src="./branding/screenshots/workspaces.png">
<em>"Order your services with Ferdium Workspaces."</em>
<img alt="Always keep your Todos list open with Ferdium Todos." src="./branding/screenshots/todos.png">
<em>"Always keep your Todos list open with Ferdium Todos."</em>
<img alt="Supporting all your services." src="./branding/screenshots/service-store.png">
<em>"Supporting all your services."</em>
</p>
</details>

## Download

👉 [ferdium.org/download](https://ferdium.org/download/)

Assets made available via [GitHub releases](https://github.com/ferdium/ferdium-app/releases/latest).

_Find answers to frequently asked questions on [ferdium.org/faq](https://ferdium.org/faq/)._

## Unsigned Nightlies on MacOS

Since we are waiting to acquire the Apple Developer License, we are publishing our nightlies without being signed. If you download these, and are on MacOS beyond Catalina, you will face the issue that the OS says the `dmg` is corrupted. If so, please run the command in [this comment](https://github.com/ferdium/ferdium-app/issues/34#issuecomment-1107655575)

## Migrating from Ferdi

If you are a pre-existing user of Ferdi, and are thinking of switching to Ferdium, you might want to run [the following script](./scripts/migration/migrate-windows.ps1) to migrate your existing Ferdi profile such that Ferdium can pick up the configurations.

## Contributing

Please read the [contributing guidelines](CONTRIBUTING.md) to setup your development machine and proceed.

<!-- TODO: Uncomment once we have integrated with opencollective
## Contributors ✨

Special thanks goes to these awesome people:

<a href="https://github.com/ferdium/ferdium-app/blob/develop/.all-contributorsrc" target="_blank"><img src="https://opencollective.com/ferdium/contributors.svg?avatarHeight=42&width=890&button=off"></a>

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
-->
