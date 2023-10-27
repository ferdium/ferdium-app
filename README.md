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

[![Builds](https://github.com/ferdium/ferdium-app/actions/workflows/builds.yml/badge.svg)](https://github.com/ferdium/ferdium-app/actions/workflows/builds.yml)
[![Crowdin](https://badges.crowdin.net/ferdium-app/localized.svg)](https://crowdin.com/project/ferdium-app)

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/ferdium/ferdium-app?label=Latest%20Release%20Version)](https://github.com/ferdium/ferdium-app/releases/latest)
[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/ferdium/ferdium-app?include_prereleases&label=Pre-release%20Version)](https://github.com/ferdium/ferdium-app/releases)
![GitHub all releases downloads](https://img.shields.io/github/downloads/ferdium/ferdium-app/total?label=Total%20Releases%20Downloaded&color=ac72b0)
![GitHub downloads (by tag)](https://img.shields.io/github/downloads/ferdium/ferdium-app/latest/total?color=blue)

[![Open Collective backers](https://img.shields.io/static/v1?label=Contribute%20on%20Open%20Collective&message=Donate%20to%20Ferdium&color=9cf&logo=open-collective)](https://opencollective.com/ferdium#category-CONTRIBUTE)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href='#contributors-'><img src='https://img.shields.io/badge/contributors-315-default.svg?logo=github&color=6c64e4' alt='Contributors'/></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->

- [Ferdium](#ferdium)
  - [Screenshots](#screenshots)
  - [Download](#download)
  - [Migrating from Ferdi](#migrating-from-ferdi)
  - [Styling](#styling)
  - [Contributing](#contributing)
  - [Contributors ✨](#contributors-)

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

👉 [ferdium.org/download](https://ferdium.org/download)

Assets made available via [GitHub releases](https://github.com/ferdium/ferdium-app/releases/latest).

_Find answers to frequently asked questions on [ferdium.org/faq](https://ferdium.org/faq)._

## Migrating from Ferdi

If you are a pre-existing user of Ferdi, and are thinking of switching to Ferdium, you might want to run [the following scripts](./scripts/migration) to migrate your existing Ferdi profile such that Ferdium can pick up the configurations. (.ps1 for PowerShell/Windows users and .sh for UNIX (Linux and MacOS users). For a more detailed explanation, please see [MIGRATION.md](docs/MIGRATION.md)

## Styling

You can style Ferdium's UI with the `USER_DATA/Ferdium/config/custom.css` file.

> **Note**
>
> `USER_DATA`'s location depends on your platform:
>
> - **Windows**: `%APPDATA%`
> - **Linux**: `$XDG_CONFIG_HOME` or `~/.config/`
> - **MacOS**: `~/Library/Application Support`

## Contributing

Please read the [contributing guidelines](CONTRIBUTING.md) to setup your development machine and proceed.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://vantezzen.io' title='Bennett: code, design, doc, ideas, translation, example, bug, content, infra, userTesting, question, projectManagement, review, translation'><img src='https://avatars2.githubusercontent.com/u/10333196?v=4' alt='vantezzen' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://twitter.com/kytwb' title='Amine Mouafik: code, design, doc, ideas, bug, content, infra, userTesting, question, projectManagement, review, maintenance, platform, fundingFinding, blog, translation'><img src='https://avatars0.githubusercontent.com/u/412895?v=4' alt='kytwb' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://www.adlk.io' title='Stefan Malzner: code, content, design, doc, ideas, infra, projectManagement, test, translation'><img src='https://avatars1.githubusercontent.com/u/3265004?v=4' alt='adlk' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Makazzz' title='Makazzz: bug, code, translation, content, doc, platform, translation'><img src='https://avatars2.githubusercontent.com/u/49844464?v=4' alt='Makazzz' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://seriesgt.com' title='ZeroCool: code, ideas'><img src='https://avatars3.githubusercontent.com/u/5977640?v=4' alt='ZeroCool940711' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/rseitbekov' title='rseitbekov: code'><img src='https://avatars2.githubusercontent.com/u/35684439?v=4' alt='rseitbekov' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://djangogigs.com/developers/peter-bittner/' title='Peter Bittner: ideas, bug'><img src='https://avatars2.githubusercontent.com/u/665072?v=4' alt='bittner' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/justus-saul' title='Justus Saul: bug, ideas'><img src='https://avatars1.githubusercontent.com/u/5861826?v=4' alt='justus-saul' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/igreil' title='igreil: ideas'><img src='https://avatars0.githubusercontent.com/u/17239151?v=4' alt='igreil' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://marcolopes.eu' title='Marco Lopes: ideas'><img src='https://avatars1.githubusercontent.com/u/431889?v=4' alt='marcolopes' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/dayzlun' title='dayzlun: bug'><img src='https://avatars3.githubusercontent.com/u/17259690?v=4' alt='dayzlun' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://twitter.com/tobigue_' title='Tobias Günther: ideas'><img src='https://avatars2.githubusercontent.com/u/1560152?v=4' alt='tobigue' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/AGCaesar' title='AGCaesar: platform'><img src='https://avatars3.githubusercontent.com/u/7844066?v=4' alt='AGCaesar' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/xthursdayx' title='xthursdayx: code, doc, infra, platform'><img src='https://avatars0.githubusercontent.com/u/18044308?v=4' alt='xthursdayx' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Gaboris' title='Gaboris: question, bug'><img src='https://avatars2.githubusercontent.com/u/9462372?v=4' alt='Gaboris' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://www.cu3ed.com/' title='Ce: bug'><img src='https://avatars1.githubusercontent.com/u/61343?v=4' alt='incace' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://pztrn.name/' title='Stanislav N.: bug'><img src='https://avatars1.githubusercontent.com/u/869402?v=4' alt='pztrn' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://www.patrickcurl.com' title='Patrick Curl: ideas'><img src='https://avatars1.githubusercontent.com/u/1470061?v=4' alt='patrickcurl' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Stanzilla' title='Benjamin Staneck: design'><img src='https://avatars3.githubusercontent.com/u/75278?v=4' alt='Stanzilla' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/ammarmalhas' title='ammarmalhas: bug, security'><img src='https://avatars1.githubusercontent.com/u/57057209?v=4' alt='ammarmalhas' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/steliyan' title='Steliyan Stoyanov: code, ideas'><img src='https://avatars1.githubusercontent.com/u/1850292?v=4' alt='steliyan' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/brorbw' title='Bror Winther: doc'><img src='https://avatars2.githubusercontent.com/u/5909562?v=4' alt='brorbw' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://fwdekker.com/' title='Felix W. Dekker: doc'><img src='https://avatars0.githubusercontent.com/u/13442533?v=4' alt='FWDekker' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Sauceee' title='Sauceee: design'><img src='https://avatars2.githubusercontent.com/u/17987941?v=4' alt='Sauceee' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://lhw.ring0.de' title='Lennart Weller: platform'><img src='https://avatars2.githubusercontent.com/u/351875?v=4' alt='lhw' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/jereksel' title='Andrzej Ressel: code'><img src='https://avatars0.githubusercontent.com/u/1307829?v=4' alt='jereksel' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://gitlab.com/dpeukert' title='Daniel Peukert: code'><img src='https://avatars2.githubusercontent.com/u/3451904?v=4' alt='dpeukert' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Ali_Shiple' title='Ali M. Shiple: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12895436/small/00917d09ca1b4b6d8e0ef36af07ecf6b.jpg' alt='Ali_Shiple' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/elviseras' title='elviseras: translation'><img src='https://www.gravatar.com/avatar/25c2cf0d8cb4a4141e71c3b8a2e9324f' alt='elviseras' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/J370' title='J370: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14141203/small/7b12b5db419d8796450221c2eaaf6003.png' alt='J370' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/keunes' title='Koen: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13018172/small/829115c606347b10218f34c637a2100c.png' alt='keunes' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/leandrogehlen' title='Leandro Gehlen: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14099621/small/1d9503523839c310dbce0af3c226e894.jpeg' alt='leandrogehlen' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Matthieu42' title='Matthieu42: translation'><img src='https://www.gravatar.com/avatar/735217ccccf11ba97573deee517ddb19' alt='Matthieu42' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/nicky18013' title='Nikita Bibanaev: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13468928/small/2b31e7ac19645d950a79b33ffd5721b8.png' alt='nicky18013' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Tatjana1998' title='Tatjana1998: translation'><img src='https://www.gravatar.com/avatar/ade202a04fcbb2c177e4f1d9936af29e' alt='Tatjana1998' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/seayko' title='tinect: translation'><img src='https://www.gravatar.com/avatar/65e2aef738ddf828f822d8463fd04918' alt='seayko' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Pusnow' title='Wonsup Yoon: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13514833/small/65f0b45587cc7e34f2827830cd324b16.jpeg' alt='Pusnow' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/zutt' title='zutt: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13320003/small/50fdf9f8c7e54a446925bd79696ea625.JPG' alt='zutt' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://twitter.com/noemis_exec' title='n0emis: code, translation'><img src='https://avatars3.githubusercontent.com/u/22817873?v=4' alt='n0emis' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://www.monke-agency.com/equipe.html' title='gmarec: code'><img src='https://avatars2.githubusercontent.com/u/3405028?v=4' alt='gmarec' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/127oo1' title='127oo1: translation'><img src='https://www.gravatar.com/avatar/060c722be11da16ae31902e9c98326b2' alt='127oo1' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/ChTBoner' title='ChTBoner: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13273153/small/a810886febf5199cfa1c98644444dea7.jpeg' alt='ChTBoner' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/johanengstrand' title='Johan Engstrand: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14152801/small/fd395f120efca971ca9b34c57fd02cca.png' alt='johanengstrand' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://mrassili.com' title='Marouane R: code'><img src='https://avatars0.githubusercontent.com/u/25288435?v=4' alt='mrassili' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/yourcontact' title='Roman: code, ideas'><img src='https://avatars2.githubusercontent.com/u/46404814?v=4' alt='yourcontact' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/mahadevans87' title='Mahadevan Sreenivasan: code, ideas, review, bug, doc, userTesting'><img src='https://avatars1.githubusercontent.com/u/1255523?v=4' alt='mahadevans87' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://jakelee.co.uk' title='Jake Lee: content'><img src='https://avatars2.githubusercontent.com/u/12380876?v=4' alt='JakeSteam' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/sampathBlam' title='Sampath Kumar Krishnan: code, review, ideas, bug, doc, userTesting'><img src='https://avatars1.githubusercontent.com/u/17728976?v=4' alt='sampathBlam' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/saruwman' title='saruwman: doc, code'><img src='https://avatars2.githubusercontent.com/u/41330038?v=4' alt='saruwman' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/dorukkarinca' title='dorukkarinca: bug'><img src='https://avatars0.githubusercontent.com/u/9303867?v=4' alt='dorukkarinca' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://www.linkedin.com/in/gautamsi' title='Gautam Singh: code'><img src='https://avatars2.githubusercontent.com/u/5769869?v=4' alt='gautamsi' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://feikojoosten.com' title='Feiko Joosten: code'><img src='https://avatars0.githubusercontent.com/u/10920052?v=4' alt='FeikoJoosten' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/2bdelghafour' title='2bdelghafour: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14219410/small/31ff20f60d352fb46e314f3c180a77b0.jpeg' alt='2bdelghafour' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/abdoutanta' title='Abderrahim Tantaoui: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14213908/small/5b2fc8166f8a0a2b7313fbf49ee5b6b6.jpeg' alt='abdoutanta' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/AndiLeni' title='AndiLeni: translation'><img src='https://www.gravatar.com/avatar/4bd0da860de38afa735425ce2d4e10b5' alt='AndiLeni' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/brunofalmada' title='Bruno Almada: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14200540/small/f6f1addceeeabc02488f9b08520a902f.jpeg' alt='brunofalmada' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Catarino' title='Catarino Gonçalo: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14208802/small/07287eb2de671257ca3d6bb4ba1cca67.jpeg' alt='Catarino' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Alzemand' title='Edilson Alzemand Sigmaringa Junior: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14184269/small/f5e68247f01988ae7951a282f0fd4d06.jpeg' alt='Alzemand' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/MAT-OUT' title='MAT-OUT: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14201550/small/68dd2402bf2879bc3ca312d627710400.png' alt='MAT-OUT' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mazzo98' title='mazzo98: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12864917/small/69799b5fd7be2f67282715d5cdfd4ae1.png' alt='mazzo98' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/paprika-naught-tiffin-flyspeck' title='paprika-naught-tiffin-flyspeck: translation'><img src='https://www.gravatar.com/avatar/8671ebe7a7164dfa7624fbdbff69ed96' alt='paprika-naught-tiffin-flyspeck' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/patrickvalle' title='Patrick Valle: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14217484/small/8b73f313ee79fe33625e819cdac86551.jpg' alt='patrickvalle' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/peq42' title='peq42_: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14155811/small/b62a94dde7ec29948ec6a6af9fd24b1d.png' alt='peq42' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/karlinhos' title='Pumbinha: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14161139/small/96450eb44c22b3141ab4401e547109b8.png' alt='karlinhos' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/dies' title='Serhiy Dmytryshyn: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/1/small/e84bcdf6c084ffd52527931f988fb410.png' alt='dies' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/SMile61' title='SMile61: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14177585/small/1bb4f6ba39bff3df8f579e61460ce016.png' alt='SMile61' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/tinect' title='tinect: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12521988/small/56c2041645746af9e51dd28782b828c3.jpeg' alt='tinect' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/gega7' title='gega7: bug'><img src='https://avatars0.githubusercontent.com/u/20799911?v=4' alt='gega7' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/tristanplouz' title='tristanplouz: code, ideas, translation'><img src='https://avatars2.githubusercontent.com/u/6893466?v=4' alt='tristanplouz' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/dannyqiu' title='Danny Qiu: code, bug'><img src='https://avatars1.githubusercontent.com/u/1170755?v=4' alt='dannyqiu' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/belyazidi56' title='Youssef Belyazidi: code'><img src='https://avatars3.githubusercontent.com/u/35711540?v=4' alt='belyazidi56' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/gabspeck' title='Gabriel Speckhahn: platform'><img src='https://avatars2.githubusercontent.com/u/749488?v=4' alt='gabspeck' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/dandelionadia' title='Nadiia Ridko: code'><img src='https://avatars0.githubusercontent.com/u/33199975?v=4' alt='dandelionadia' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://hohner.dev' title='Jan Hohner: userTesting, translation'><img src='https://avatars0.githubusercontent.com/u/649895?v=4' alt='janhohner' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://marussy.com' title='Kristóf Marussy: code, maintenance, review'><img src='https://avatars1.githubusercontent.com/u/38888?v=4' alt='kris7t' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://cl.linkedin.com/in/juanvalentinmoraruiz' title='Juan Mora: code'><img src='https://avatars0.githubusercontent.com/u/4575267?v=4' alt='raicerk' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://tofran.com' title='Francisco Marques: code'><img src='https://avatars2.githubusercontent.com/u/5692603?v=4' alt='tofran' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://digitalcoyote.github.io/NuGetDefense/' title='Curtis Carter: platform'><img src='https://avatars3.githubusercontent.com/u/16868093?v=4' alt='digitalcoyote' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/kawarimidoll' title='カワリミ人形: doc'><img src='https://avatars0.githubusercontent.com/u/8146876?v=4' alt='kawarimidoll' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://immortal-pc.info/' title='1mm0rt41PC: code'><img src='https://avatars0.githubusercontent.com/u/5358076?v=4' alt='1mm0rt41PC' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://code-addict.pl' title='Michał Kostewicz: code'><img src='https://avatars.githubusercontent.com/u/6313392?v=4' alt='k0staa' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://www.linkedin.com/in/yogainformatika/' title='Yoga Setiawan: code, platform'><img src='https://avatars.githubusercontent.com/u/1139881?v=4' alt='arioki1' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/MosheGross' title='Moshe Gross: code'><img src='https://avatars.githubusercontent.com/u/77084755?v=4' alt='MosheGross' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/stnkl' title='Stephan Rumswinkel: code, bug'><img src='https://avatars.githubusercontent.com/u/17520641?v=4' alt='stnkl' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/vraravam' title='Vijay Raghavan Aravamudhan: maintenance, doc, code, mentoring, review, infra, ideas, bug, content, userTesting, projectManagement, translation'><img src='https://avatars.githubusercontent.com/u/69629?v=4' alt='vraravam' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://dustin.meecolabs.eu/' title='Dustin: design'><img src='https://avatars.githubusercontent.com/u/124467?v=4' alt='alopix' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/jakobsudau' title='Jakob Felix Julius Sudau: design'><img src='https://avatars.githubusercontent.com/u/721715?v=4' alt='jakobsudau' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://prasans.info' title='Prasanna: code'><img src='https://avatars.githubusercontent.com/u/380340?v=4' alt='prasann' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/markandan' title='Markandan R: code'><img src='https://avatars.githubusercontent.com/u/7975763?v=4' alt='markandan' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://markushatvan.com' title='Markus Hatvan: code, ideas, design, review, infra, translation'><img src='https://avatars.githubusercontent.com/u/16797721?v=4' alt='mhatvan' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://sergiu.dev/' title='Sergiu Ghitea: code'><img src='https://avatars.githubusercontent.com/u/28300158?v=4' alt='sergiughf' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/ArviTheMan' title='ArviTheMan: doc'><img src='https://avatars.githubusercontent.com/u/73516201?v=4' alt='ArviTheMan' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://bandism.net/' title='Ikko Ashimine: code'><img src='https://avatars.githubusercontent.com/u/22633385?v=4' alt='eltociear' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/madsmtm' title='Mads Marquart: translation'><img src='https://avatars.githubusercontent.com/u/10577181?v=4' alt='madsmtm' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://mateusz.loskot.net/' title='Mateusz Łoskot: doc'><img src='https://avatars.githubusercontent.com/u/80741?v=4' alt='mloskot' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/skoshy' title='Stefan K: doc'><img src='https://avatars.githubusercontent.com/u/369825?v=4' alt='skoshy' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/graves501' title='graves501: doc'><img src='https://avatars.githubusercontent.com/u/11211125?v=4' alt='graves501' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://www.ekino.com' title='Sadetdin EYILI: code, bug, userTesting'><img src='https://avatars.githubusercontent.com/u/5607440?v=4' alt='sad270' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Tsakatac' title='Tsakatac: bug'><img src='https://avatars.githubusercontent.com/u/89021195?v=4' alt='Tsakatac' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://niute.ch' title='niu tech: code, bug'><img src='https://avatars.githubusercontent.com/u/384997?v=4' alt='niutech' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Suvarna221B' title='Suvarna Sivadas: code'><img src='https://avatars.githubusercontent.com/u/31803071?v=4' alt='Suvarna221B' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/johan-mathew' title='Johan Mathew: code'><img src='https://avatars.githubusercontent.com/u/31700508?v=4' alt='johan-mathew' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/AjeshKumarS' title='Ajesh Kumar S: code'><img src='https://avatars.githubusercontent.com/u/31558237?v=4' alt='AjeshKumarS' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/sreelekhaMarasig' title='Ajesh Kumar S: code'><img src='https://avatars.githubusercontent.com/u/93112178?v=4' alt='sreelekhaMarasig' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/MadhuriBandanadam' title='Madhuri: code'><img src='https://avatars.githubusercontent.com/u/63137999?v=4' alt='MadhuriBandanadam' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/abinmn' title='Abin Mn: code'><img src='https://avatars.githubusercontent.com/u/29946484?v=4' alt='abinmn' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/AnjithPaul' title='Anjith Paul: code'><img src='https://avatars.githubusercontent.com/u/65152866?v=4' alt='AnjithPaul' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Vishnu017' title='Vishnu017: code'><img src='https://avatars.githubusercontent.com/u/39431453?v=4' alt='Vishnu017' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/rachelcynthia' title='Rachel Cynthia V: code'><img src='https://avatars.githubusercontent.com/u/46859572?v=4' alt='rachelcynthia' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Chandrika-Priya' title='Chandrika Priya Bogadi: code'><img src='https://avatars.githubusercontent.com/u/46720139?v=4' alt='Chandrika-Priya' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Dee-Bajaj' title='Deepti: code'><img src='https://avatars.githubusercontent.com/u/66486870?v=4' alt='Dee-Bajaj' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/DarsiSreelekha' title='DarsiSreelekha: code'><img src='https://avatars.githubusercontent.com/u/89741061?v=4' alt='DarsiSreelekha' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/klaegera' title='Adrian Klaeger: code, bug'><img src='https://avatars.githubusercontent.com/u/34807567?v=4' alt='klaegera' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/martinbernat' title='martinbernat: code, bug, translation'><img src='https://avatars.githubusercontent.com/u/6809891?v=4' alt='martinbernat' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/dedotombo' title='dedotombo: code'><img src='https://avatars.githubusercontent.com/u/42537874?v=4' alt='dedotombo' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/leofiore' title='Leonardo: bug'><img src='https://avatars.githubusercontent.com/u/655964?v=4' alt='leofiore' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/crscaballero' title='Cristian Caballero: bug, userTesting'><img src='https://avatars.githubusercontent.com/u/48134692?v=4' alt='crscaballero' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://userfriendly.tech' title='Greg Netsas: userTesting'><img src='https://avatars.githubusercontent.com/u/2423362?v=4' alt='klonos' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/rmkanda' title='Ramakrishnan Kandasamy: review'><img src='https://avatars.githubusercontent.com/u/38713281?v=4' alt='rmkanda' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/xrup' title='xrup: translation'><img src='https://www.gravatar.com/avatar/9e65aa6d4db623146ec4c571db081a6d' alt='xrup' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/daedgoco' title='daedgoco: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14233276/small/8823401d22f9ae6865925e4f20eb15e1.png' alt='daedgoco' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/adria.soce' title='Adrià Solé: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14234338/small/6dc05d89e672bd624e9e37253f852b77.jpeg' alt='adria.soce' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/endersonmenezes' title='Enderson Menezes: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14234572/small/384477b34fae0a3f98f386cc658b9494.jpeg' alt='endersonmenezes' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Ali-Alqazwini' title='ali: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14236770/small/328f8ae5f996f60bb2c174a9f8f808ec.jpeg' alt='Ali-Alqazwini' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/martonnagy' title='Marton Nagy: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14243516/small/54af6111fd1260698f1b6d187245e074.jpeg' alt='martonnagy' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/edsonmanuelcarballovera' title='Edson Manuel Carballo Vera: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14244460/small/28a9b867da8e2b92904d79348cb39a55.jpeg' alt='edsonmanuelcarballovera' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/xelio_91_' title='alby.grassi: translation'><img src='https://www.gravatar.com/avatar/47a0291b35c0031ad0fee6b7cf717728' alt='xelio_91_' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mos.vasilis' title='Vasilis Moschopoulos: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14266920/small/47c551cf2f468d43a4449a74d8134cc0.jpg' alt='mos.vasilis' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/crystyanalencar' title='crystyanalencar: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14289028/small/288f15e47856de74b8fdda14ed8d9b69.png' alt='crystyanalencar' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/larsmagnusherland' title='larsmagnusherland: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13219280/small/424b39a9b0f10a08f63eb1aaea1ba180.png' alt='larsmagnusherland' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/GPMartins' title='GPMartins: translation'><img src='https://www.gravatar.com/avatar/b0d3d14cd9dddfbde33ebbb8ec93b997' alt='GPMartins' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/MosciolaroMike' title='Michelangelo Amoruso Manzari: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14312004/small/06d41030406626131151993d08164756.jpeg' alt='MosciolaroMike' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/nicolo.castellini' title='Nicoló Castellini: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14315116/small/e28f5f575b7cac2e62ad38dbeefa287d.jpeg' alt='nicolo.castellini' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/ValleBL' title='Valentin: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14316376/small/10e3598076d2bc111c4377633cf5a77c.jpeg' alt='ValleBL' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Jashnok' title='Joshua: translation'><img src='https://www.gravatar.com/avatar/f9d8eedb517530409b8dd9415b29ae74' alt='Jashnok' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mulettohonor' title='Muletto Honor: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14320218/small/31446d0a50fe681a174dcfce6ccb863b.jpg' alt='mulettohonor' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mysticfall' title='Xavier Cho: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14325066/small/ea4c81f6e5a2320d077679986808e618.jpeg' alt='mysticfall' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/borntzal' title='borntzal: translation'><img src='https://www.gravatar.com/avatar/b9fe7367a9c911e427a22f5214732e4d' alt='borntzal' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mahoganypinewood' title='Norbert Kőhegyi: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14342206/small/3de2d02f113a1950869a38970ce550db.jpg' alt='mahoganypinewood' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/eandersons' title='Edgars: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13356613/small/d25f02bc7a75913ce9a11d3c61be6477.png' alt='eandersons' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/cnoguerol' title='César Noguerol: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14371498/small/77c91c1552d0303285eee49a7233bb2a.jpeg' alt='cnoguerol' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/pjs21s' title='JinSang Park: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14377502/small/f64299e436a34afa05cab3827a0c8b11.jpeg' alt='pjs21s' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/tcarreira' title='Tiago Carreira: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14378030/small/e3cf7bb00b6a1711dab58c59ea04cee3.jpeg' alt='tcarreira' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/huantrg' title='Huan Tran: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14394210/small/ac7208150dfb9196ce6a494390bdfa51.jpeg' alt='huantrg' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/maximax' title='maximax: translation'><img src='https://www.gravatar.com/avatar/a537523faffbbf55a0f39471143c3264' alt='maximax' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/birobirobiro) (birobirobiro' title='João Inácio (birobirobiro): translation'><img src='https://www.gravatar.com/avatar/2ea06a80ecd7e4a34acfa43cfa01fa25' alt='birobirobiro) (birobirobiro' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/pludi' title='Peter L.: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14038315/small/22f4df26f65181a7d3a9de773d11315d.png' alt='pludi' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/algonrey' title='Alberto González: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14446576/small/e2423064f8b64e4d91eb1d26d1c9e3ed.png' alt='algonrey' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mganovelli' title='mganovelli: translation'><img src='https://www.gravatar.com/avatar/73572bf6ada06e0a31902a679231d339' alt='mganovelli' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/dvirmalka' title='Dvir M: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14451536/small/e724aa43f781c935e408be99e679fe5e.jpg' alt='dvirmalka' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Emilio_D' title='Daniel Brandobur: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14452294/small/13b5c161612a2f366078b563e9f5e08b.png' alt='Emilio_D' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/totoyeah' title='totoderek: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14465378/small/234131e24d58cb37ca87aea532d3d347.png' alt='totoyeah' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/kev.cabrerar' title='Kevin Cabrera: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14471950/small/383c6a879a45001c36228e17e2d81090.png' alt='kev.cabrerar' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/hugosantosmobile' title='Hugo Santos: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14477058/small/e8a048695e4de818fdf1e3e1326d14c4.png' alt='hugosantosmobile' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/sbglasius' title='Søren Berg Glasius: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14480260/small/9643f9f295172a5a9959209eee3999bd.png' alt='sbglasius' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mustbedreaming' title='mustbedreaming: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14482836/small/32bf7ac73042f53cb9b7c82c57023ddb.png' alt='mustbedreaming' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Carsso' title='Germain Carré: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12353537/small/d9567780a35d1e674cf47a69c301b0c4.png' alt='Carsso' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/dominikbullo' title='Dominik Bullo: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14494704/small/1debb3d67c6ad7d7f45f0b7a38eb21a7.jpeg' alt='dominikbullo' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/gonperezramirez' title='Gonzalo Pérez: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14504898/small/4f20dd9bbc823c78568eb6f1cfb2aeb9.jpeg' alt='gonperezramirez' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Carlescampins' title='Carlescampins: translation'><img src='https://www.gravatar.com/avatar/b84ccc92d132102110b7aec628f47b6a' alt='Carlescampins' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/cverond' title='Cristiano Verondini: translation'><img src='https://www.gravatar.com/avatar/70e4384a871e45743f26bdcc21303c56' alt='cverond' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/eliyahillel' title='אליה הלל: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14367648/small/834d1cf668a6ca97b2c66093019b5991.jpeg' alt='eliyahillel' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/sfkmk' title='Samuel Francois Köhler: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14541090/small/f0a810349778c46b7572301340b471e8.jpeg' alt='sfkmk' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Letrab' title='Bartel: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14544608/small/91c226dbb12aa1067e294cd5c4332ae1.png' alt='Letrab' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/alexmartins' title='Alexandre Martins: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14544796/small/e3c922101c1ceb7c7a6b7bd165a15d98.jpeg' alt='alexmartins' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/jartsa' title='Jari Myrskykari: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14080739/small/6dadf0a40522a0e918f746f2b32e6c27.jpg' alt='jartsa' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/ugurcansayan' title='Uğurcan Sayan: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13023570/small/96cfec0b4d18e4b26b59dfeeaa369cf6.jpg' alt='ugurcansayan' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/nasmi3' title='Alex: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14563170/small/072d3aadc3866c16ed1a5b5082e81f26.png' alt='nasmi3' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/n-mitic' title='Nikola Mitić: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14588102/small/5f8b6b73c8d583e6b424607470c09cb7.jpeg' alt='n-mitic' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/fawkulce' title='fawkulce: translation'><img src='https://www.gravatar.com/avatar/9004e98cd5e707875b3dd9268214a664' alt='fawkulce' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Glenac' title='Glenac: translation'><img src='https://www.gravatar.com/avatar/080652c67697630c9885a1157ad8a360' alt='Glenac' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/victoriousnathan55' title='Victorious: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14319626/small/120632761f7821f4cbfdac046086b6e7.jpeg' alt='victoriousnathan55' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/raoul-m' title='Raoul Molai: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13238611/small/2906ff4c9e8704be8cb86d1b1cb124b1.jpg' alt='raoul-m' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/nathanaelhoun' title='Nathanaël: translation, infra'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14628456/small/7c0f5919fba56edfddf08bf715039f75.jpeg' alt='nathanaelhoun' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/radulaurentiu' title='Laurentiu Radu: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14631958/small/c3a0112e9eb596f0a54cdebf5d99b82a.jpg' alt='radulaurentiu' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/GiacomoGuaresi' title='GiacomoGuaresi: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14659702/small/12e79e3fc332762058ee525a95b72447.jpeg' alt='GiacomoGuaresi' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/cohedz' title='Hung Nguyen: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14664150/small/18ae8a7eaa36ba6202fa43eedd84b8d2.jpg' alt='cohedz' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/facundo_ingenia' title='Facundo Saravia: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14672204/small/eaf2caaff3d2851fabb3d74f76d0542e.png' alt='facundo_ingenia' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/llsaboya' title='Lefebvre Saboya: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14682462/small/ee313d9b222ea3d1f10bd337d6cb6fce.jpeg' alt='llsaboya' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/beez276' title='beez276: translation'><img src='https://www.gravatar.com/avatar/4a5e7e0b13e365d0783e480ddff338fc' alt='beez276' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/namu' title='namu: translation'><img src='https://www.gravatar.com/avatar/ddf44bc1e0a05ca46fa9b81f1f916f15' alt='namu' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/kauelima' title='Kaue Lima: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13054953/small/3319b5f15e0452b664f94e632d51276e.jpeg' alt='kauelima' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/AlexDep' title='AlexDep: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14705362/small/ba978b0356a94767dc79441c70aee964.png' alt='AlexDep' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/tanloibdp' title='Nguyễn Tấn Lợi: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14736534/small/42b4da2ca619a6517adbb38bc60c7e5c.jpeg' alt='tanloibdp' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/vovven' title='Alex Widén: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14748884/small/9829dddc625adca8d20e9687f40f009e.jpeg' alt='vovven' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/amin_tado' title='amin_tado: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12875002/small/fea4dcbf0c1e15743c467d0e152e43d9.jpg' alt='amin_tado' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Rintan' title='Rintan: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12710633/small/bd1081c95585021cb9862a5f9d1756ec.png' alt='Rintan' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/rishubil' title='Nesswit: translation'><img src='https://www.gravatar.com/avatar/4943e03e0f0cf28d12fbc98064b3f244' alt='rishubil' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/AmazingClaymore' title='Elia De Togni: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14812758/small/a9f623f45c833c7ba7f04cf2962f3793.png' alt='AmazingClaymore' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/zkm3f' title='zkm3f: translation'><img src='https://www.gravatar.com/avatar/2c79623d62d2bb36b31883abd5b08a12' alt='zkm3f' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/PrinceNorris' title='Sebastian Jasiński: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13962625/small/552e23414407b34f8f67db5ea49a5604.png' alt='PrinceNorris' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/MoaufmKlo' title='MoaufmKlo: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13720247/small/e01249ad9a091fda233cfaec0774c1fc.png' alt='MoaufmKlo' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/marcosorso' title='Marcos Orso: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14830692/small/0550fa339b76765dd8b200afabd43b0a.jpeg' alt='marcosorso' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/popdisk' title='Nice Brown: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14844316/small/5a12669ef15f26b6c53a5d5afe38a6b3.jpeg' alt='popdisk' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Loremed' title='Loremed: translation'><img src='https://www.gravatar.com/avatar/76d86c860fa5bdc1694ff9c7dc9778fb' alt='Loremed' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/yarinShapira' title='yarinShapira: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14845706/small/abf9ec9309f40dfcb01eae2c8fca02fb.png' alt='yarinShapira' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Kissadere' title='Christopher Coss: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12721969/small/8feaec1d16dd268e5ec29204a6e1d080.jpg' alt='Kissadere' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/portakalimsi' title='Buğra Çağlar: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13990869/small/a4e0b16904126d8e0d014d952f4bc1b6.jpeg' alt='portakalimsi' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/sobeitnow0' title='sobeitnow0: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14738292/small/727b33d7bd2ca021cf85b788c6cee9d1.jpeg' alt='sobeitnow0' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/dinzahir99' title='Muhammad Zahiruddin: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12732934/small/cae45ad9864def2074b1e3c35efce683.png' alt='dinzahir99' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/aninuscsalas' title='Aninus Partikler: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14358620/small/7f3849dd7ea25ac874fac1986810e329.png' alt='aninuscsalas' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/wellingtonsmelo.android' title='Wellington Melo: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14888906/small/8d128e54285cac52c0e50e53d4691c82.jpeg' alt='wellingtonsmelo.android' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/miangou' title='miangou: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14891930/small/78e766643ac488bebc490ecf4677c0c9.jpeg' alt='miangou' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/HelaBasa' title='Store: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13976107/small/ab4177e8d90665d4603e548488d15c68.jpg' alt='HelaBasa' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/technowhizz' title='technowhizz: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14897978/small/2d2a416e423758dd52a3dd0f657fdf0c.jpeg' alt='technowhizz' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/LucasMasrider' title='Trần Lê Quốc Huy: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14613056/small/090933fb64948358fa226ad830de2b21.jpg' alt='LucasMasrider' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mble' title='Maciej Błędkowski: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14273256/small/7df80579990a9d9e3cf672d04b372297.jpeg' alt='mble' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/d3ward' title='d3ward: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13781643/small/bf617deeeba0d2efafef223ddb1c3c03.png' alt='d3ward' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/amyaan' title='amyaan: translation'><img src='https://www.gravatar.com/avatar/eac6ef8c854035fa9af245f866da0a42' alt='amyaan' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/fredwilliamtjr' title='Fred William Torno Junior: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14932371/small/e694cada2c8fd7924162e1badcc6af3f.png' alt='fredwilliamtjr' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/luis449bp' title='José Luis Bandala Pérez: translation'><img src='https://www.gravatar.com/avatar/e7dbf284ff40c3c32845e1b95d257c61' alt='luis449bp' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/gurbii' title='gurbii: translation'><img src='https://www.gravatar.com/avatar/bedbdd12dbf6df0abed084a7f6efe772' alt='gurbii' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/13luizhenrique' title='Luiz Henrique: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13926183/small/d20b071be813e20efa3a121bc2658989.png' alt='13luizhenrique' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/clementbiron' title='Clément Biron: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14951127/small/a95b2d3ff6d1b64bf0d75d561e025ec6.png' alt='clementbiron' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/ttxsyqz' title='ttxsyqz: translation'><img src='https://www.gravatar.com/avatar/8913ba1176abfc32fa2021a8ec683511' alt='ttxsyqz' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/BluePantherFIN' title='Janne Salmi: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14958709/small/f32c96756fb16350385ea3dee38626f7.jpeg' alt='BluePantherFIN' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/TheRedLadybug62' title='TheRedLadybug62: translation'><img src='https://www.gravatar.com/avatar/4b1fdb0a13f1bdf2bbfda46e9d78f2d0' alt='TheRedLadybug62' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/SiderealArt' title='曹恩逢: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12960382/small/efd52e2c41be32bfd52569ac15d228b7.jpg' alt='SiderealArt' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/jakobsson0' title='Martin Jakobsson: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14965633/small/6195809f0df9712fd7d4248d33cc846c.png' alt='jakobsson0' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Guus' title='Guus: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12495264/small/eb334ff402b0b9bf49493bfce968399d.png' alt='Guus' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/peterpacket' title='peterpacket: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14970427/small/da8ab2c6b80d2c06a3b9094e53b94db9.jpeg' alt='peterpacket' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/ogghi' title='ogghi: translation'><img src='https://www.gravatar.com/avatar/59e381507a01e1c8cf58d2521260c0e1' alt='ogghi' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/studinsky' title='Vladimir Studinsky: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13280232/small/4dd03819450e266c9b42a7eff880f9dc.jpg' alt='studinsky' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/antaljanosbenjamin' title='János Benjamin Antal: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14982759/small/174144d1761e4b9f8e50353b4dbca8d1.jpeg' alt='antaljanosbenjamin' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/oguzhankara34' title='Oğuzhan K: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14989979/small/a404ab91595a7c5cf02854477ac4c559.jpeg' alt='oguzhankara34' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/b_n' title='Ben Naylor: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14999083/small/00ae25b0d879d7578ca2d3c8c9a0c038.jpeg' alt='b_n' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/ignaciocastro' title='Ignacio Castro: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14239666/small/ac376ab1a3f35722ab4a153b26ee881a.jpeg' alt='ignaciocastro' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/lagstrom' title='Niklas Lagström: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15030387/small/329d60a44b8deba42c825e2dc1a9e7a0.jpeg' alt='lagstrom' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/jatatox' title='Greivin Cordoncillo Romero: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15031761/small/6482c4317b9aa45d3e61ef82eb77b48a.jpeg' alt='jatatox' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/gherman.ovidiu.ionut' title='Ovidiu Gherman: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15031877/small/2ccf7f461f67f226b58260e459802848.jpeg' alt='gherman.ovidiu.ionut' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/erykosky' title='Eryk Lewandowski: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15041515/small/43f0bd10f84bf785654f3412f2215df9.png' alt='erykosky' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/natas999' title='방현수: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14401308/small/e0d6f0cdc5114be795273e5b690f0896.jpeg' alt='natas999' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/MyUncleSam' title='MyUncleSam: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15046019/small/d48a41a2a7e2d205dbe3316cd834dfb6.jpeg' alt='MyUncleSam' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mcwladkoe' title='Vladyslav Samotoi: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12996072/small/be802e915089a812d93e676674c9454f.png' alt='mcwladkoe' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/vyacheslav_malashin' title='Vyacheslav Malashin: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15062315/small/397445945985e829703b1fe3e4f4ccf4.JPG' alt='vyacheslav_malashin' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/chatoskuntakinte' title='Chatos Kuntakinte: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15062523/small/acb7763df860ca67fe30dbafcf9e31e0.png' alt='chatoskuntakinte' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/e0f' title='Juha Köpman: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14443460/small/fda983d878c8cd64f9224d2c27a2a56c.jpg' alt='e0f' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/AiOO' title='AiOO: translation'><img src='https://www.gravatar.com/avatar/f39fe4e7e61f4aea84e369b5f9d9c2f6' alt='AiOO' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/musyawaroh123' title='Ibra AF: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13583172/small/f3e47a6f884ad97a5a8d354f0fe5a853.jpg' alt='musyawaroh123' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/bekwendhausen' title='Rebecca Wendhausen: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15085045/small/3afbce411d873055baca51f69d3bfd8c.png' alt='bekwendhausen' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/dastillero' title='David Astillero Pérez: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14935695/small/abf96cf0a2ccb90f0ffbd7ffad4bf6f0.jpeg' alt='dastillero' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/mscythe' title='mscythe: translation'><img src='https://www.gravatar.com/avatar/f5c7d39046e60be1692b03d09624a49e' alt='mscythe' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Privatecoder' title='Privatecoder: userTesting'><img src='https://avatars.githubusercontent.com/u/45964815?v=4' alt='Privatecoder' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://lorenzolewis.click' title='Lorenzo Lewis: code'><img src='https://avatars.githubusercontent.com/u/15347255?v=4' alt='lorenzolewis' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/niebloomj' title='Baruch Jacob Niebloom: review'><img src='https://avatars.githubusercontent.com/u/5156403?v=4' alt='niebloomj' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/jamesandariese' title='James Andariese: code'><img src='https://avatars.githubusercontent.com/u/2583421?v=4' alt='jamesandariese' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Jipem' title='Jean-Pierre MÉRESSE: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15101883/small/56a810446c7f1b7bfd566825bdf38f97.png' alt='Jipem' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/XianZongzi' title='咸粽子: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/13898579/small/a62e017825193da284eb84b7a318f6b7_default.png' alt='XianZongzi' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/barkinarga' title='Barkın Arga: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/12813629/small/44d528df52ccd5972d167835ace78078.jpg' alt='barkinarga' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Droidnius' title='Santiago: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/14790068/small/2d824af4ac6a1f41f82b24020409ae44.jpg' alt='Droidnius' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/Radiquum' title='Kentai Radiquum: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15166222/small/bb762aa8ef3fcac773487ef3ef8708ce.jpeg' alt='Radiquum' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/bymcs' title='Mehmet Can: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15166456/small/c4d6a35eb95112121b167386c044967d.png' alt='bymcs' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://crowdin.com/profile/banhetom' title='banhetom: translation'><img src='https://crowdin-static.downloads.crowdin.com/avatar/15203804/small/b8dbe2bfd68c749f7965f39ede727882.png' alt='banhetom' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://elliotthiebaut.com' title='Elliot Thiebaut: bug'><img src='https://avatars.githubusercontent.com/u/60610988?v=4' alt='ElliotThiebaut' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/woropajj' title='Jakub: bug'><img src='https://avatars.githubusercontent.com/u/57800049?v=4' alt='woropajj' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/guillermin012' title='guillermin012: ideas'><img src='https://avatars.githubusercontent.com/u/76463041?v=4' alt='guillermin012' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/SpecialAro' title='André Oliveira: code, infra, design, bug, userTesting, review, ideas'><img src='https://avatars.githubusercontent.com/u/37463445?v=4' alt='SpecialAro' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/fernandofig' title='Fernando Figueiredo: code, design'><img src='https://avatars.githubusercontent.com/u/1110864?v=4' alt='fernandofig' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://meetfranz.com/' title='Harald: code'><img src='https://avatars.githubusercontent.com/u/135914?v=4' alt='haraldox' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='http://linkedin.com/in/phmigotto' title='Peter Migotto: code'><img src='https://avatars.githubusercontent.com/u/25492456?v=4' alt='phmigotto' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/DBozhinovski' title='Darko Bozhinovski: code'><img src='https://avatars.githubusercontent.com/u/271746?v=4' alt='DBozhinovski' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://hrwg.de/' title='Rico Herwig: translation'><img src='https://avatars.githubusercontent.com/u/12065150?v=4' alt='rherwig' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/atakangktepe' title='Atakan Goktepe: code'><img src='https://avatars.githubusercontent.com/u/12830048?v=4' alt='atakangktepe' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Jensderond' title='Jens de Rond: translation'><img src='https://avatars.githubusercontent.com/u/6972822?v=4' alt='Jensderond' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/michaelhays' title='Michael Hays: code'><img src='https://avatars.githubusercontent.com/u/6445661?v=4' alt='michaelhays' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/haveneersrobin' title='Robin Haveneers: translation'><img src='https://avatars.githubusercontent.com/u/7559898?v=4' alt='haveneersrobin' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://closingin.me/' title='Rémi Weislinger: code'><img src='https://avatars.githubusercontent.com/u/2735603?v=4' alt='closingin' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/dnlup' title='dnlup: translation'><img src='https://avatars.githubusercontent.com/u/15520377?v=4' alt='dnlup' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://ywjameslin.tw/' title='YWJamesLin: translation'><img src='https://avatars.githubusercontent.com/u/4758887?v=4' alt='YWJamesLin' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/3b3ziz' title='Ahmad M. Abdelaziz: code'><img src='https://avatars.githubusercontent.com/u/11807541?v=4' alt='3b3ziz' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://hiro-group.ronc.one/' title='Alessandro Roncone: doc'><img src='https://avatars.githubusercontent.com/u/4378663?v=4' alt='alecive' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://csy54.github.io/' title='CSY54: code'><img src='https://avatars.githubusercontent.com/u/18496305?v=4' alt='CSY54' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://mazedlx.net/' title='Christian Leo-Pernold: doc'><img src='https://avatars.githubusercontent.com/u/9453522?v=4' alt='mazedlx' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://vaseker.ru/' title='Dmitry Vasilyev: translation'><img src='https://avatars.githubusercontent.com/u/1942271?v=4' alt='vaseker' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/gkotian' title='Gautam Kotian: doc'><img src='https://avatars.githubusercontent.com/u/1580240?v=4' alt='gkotian' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Guillerman' title='Guillerman: translation'><img src='https://avatars.githubusercontent.com/u/13747538?v=4' alt='Guillerman' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/jbellingham' title='Jesse Bellingham: infra'><img src='https://avatars.githubusercontent.com/u/5078290?v=4' alt='jbellingham' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://www.linkedin.com/in/konradkleine/' title='Konrad Kleine: infra'><img src='https://avatars.githubusercontent.com/u/193408?v=4' alt='kwk' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://frumania.com/' title='Marcel Törpe: code'><img src='https://avatars.githubusercontent.com/u/12220576?v=4' alt='frumania' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/melodywei861016' title='Melody Wei: code'><img src='https://avatars.githubusercontent.com/u/21094559?v=4' alt='melodywei861016' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='http://www.nielsbom.com/' title='Niels Bom: doc'><img src='https://avatars.githubusercontent.com/u/327080?v=4' alt='nielsbom' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/dabalroman' title='Roman Dąbal: code'><img src='https://avatars.githubusercontent.com/u/13556759?v=4' alt='dabalroman' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/apo-mak' title='apo-mak: translation'><img src='https://avatars.githubusercontent.com/u/25563515?v=4' alt='apo-mak' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://lecroq.be/' title='Christopher Peeters: translation'><img src='https://avatars.githubusercontent.com/u/32568187?v=4' alt='cpeetersburg' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://www.codewars.com/users/grzeswol' title='Grzegorz Wolsza: translation'><img src='https://avatars.githubusercontent.com/u/2955105?v=4' alt='grzeswol' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/imaginarny' title='imaginarny: code'><img src='https://avatars.githubusercontent.com/u/20380121?v=4' alt='imaginarny' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/jaebradley' title='Jae Bradley: doc'><img src='https://avatars.githubusercontent.com/u/8136030?v=4' alt='jaebradley' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/skoruppa' title='skoruppa: code'><img src='https://avatars.githubusercontent.com/u/899429?v=4' alt='skoruppa' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/NathanaelGandhi' title='Nathanael: infra, code'><img src='https://avatars.githubusercontent.com/u/36506137?v=4' alt='NathanaelGandhi' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Evan-aja' title='Evan: infra'><img src='https://avatars.githubusercontent.com/u/71018479?v=4' alt='Evan-aja' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/cedricroijakkers' title='Cedric Roijakkers: infra'><img src='https://avatars.githubusercontent.com/u/15158042?v=4' alt='cedricroijakkers' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://kishaningithub.github.io/' title='Kishan B: infra'><img src='https://avatars.githubusercontent.com/u/763760?v=4' alt='kishaningithub' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/cm-schl' title='cm-schl: doc'><img src='https://avatars.githubusercontent.com/u/63400209?v=4' alt='cm-schl' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://santhosh.cyou' title='Santhosh C: code'><img src='https://avatars.githubusercontent.com/u/20743451?v=4' alt='santhosh-chinnasamy' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Alt37' title='Alt37: bug'><img src='https://avatars.githubusercontent.com/u/44649402?v=4' alt='Alt37' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/MagicLegend' title='MagicLegend: bug'><img src='https://avatars.githubusercontent.com/u/3169104?v=4' alt='MagicLegend' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/Alphrag' title='Alphrag: doc, infra'><img src='https://avatars.githubusercontent.com/u/34252790?v=4' alt='Alphrag' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://maxwipfli.ch' title='Max Wipfli: code'><img src='https://avatars.githubusercontent.com/u/17591869?v=4' alt='MaxWipfli' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/davidajetter-tw' title='davidajetter-tw: doc'><img src='https://avatars.githubusercontent.com/u/105304388?v=4' alt='davidajetter-tw' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/stacksjb' title='Jesse: doc'><img src='https://avatars.githubusercontent.com/u/2865491?v=4' alt='stacksjb' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://korepov.pro/' title='Alexey Murz Korepov: code'><img src='https://avatars.githubusercontent.com/u/336662?v=4' alt='MurzNN' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='http://www.realityloop.com/' title='Brian Gilbert: design'><img src='https://avatars.githubusercontent.com/u/114017?v=4' alt='BrianGilbert' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://amangalampalli.github.io/' title='Aditya Mangalampalli: design'><img src='https://avatars.githubusercontent.com/u/25261413?v=4' alt='amangalampalli' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://cino.io' title='Ricardo Cino: infra, code'><img src='https://avatars.githubusercontent.com/u/2735602?v=4' alt='cino' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://mrksr.de' title='Markus Kaiser: infra'><img src='https://avatars.githubusercontent.com/u/5184063?v=4' alt='mrksr' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/victorbnl' title='Victor B.: code, security'><img src='https://avatars.githubusercontent.com/u/39555268?v=4' alt='victorbnl' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://nils.fahldieck.de' title='Nils Fahldieck: doc'><img src='https://avatars.githubusercontent.com/u/16440184?v=4' alt='Rabattkarte' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://gitconvex.com/' title='Neel: code'><img src='https://avatars.githubusercontent.com/u/47709856?v=4' alt='neel1996' style='width:100px;'/></a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href='https://www.linkedin.com/in/pritamsangani/' title='Pritam Sangani: code'><img src='https://avatars.githubusercontent.com/u/22857896?v=4' alt='PritamSangani' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/muhamedsalih-tw' title='muhamedsalih-tw: code'><img src='https://avatars.githubusercontent.com/u/104364298?v=4' alt='muhamedsalih-tw' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/balajiv113' title='Balaji Vijayakumar: code'><img src='https://avatars.githubusercontent.com/u/13016475?v=4' alt='balajiv113' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='http://blog.bacao.pt' title='André Bação: security'><img src='https://avatars.githubusercontent.com/u/17479246?v=4' alt='abacao' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://blog.wikichoon.com' title='Cole Robinson: doc'><img src='https://avatars.githubusercontent.com/u/1437464?v=4' alt='crobinso' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/deadmeu' title='deadmeu: code'><img src='https://avatars.githubusercontent.com/u/12111013?v=4' alt='deadmeu' style='width:100px;'/></a></td>
      <td align="center" valign="top" width="14.28%"><a href='https://github.com/MentorPK' title='Pawel Kowalski: code'><img src='https://avatars.githubusercontent.com/u/25907418?v=4' alt='MentorPK' style='width:100px;'/></a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
