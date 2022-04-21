# Contributing to Ferdium 6

:tada: First off, thanks for taking the time and your effort to make Ferdium better! :tada:

## Table of contents

<!-- TOC depthFrom:2 depthTo:2 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Table of contents](#table-of-contents)
- [Code of Conduct](#code-of-conduct)
- [What should I know before I get started?](#what-should-i-know-before-i-get-started)
- [How can I contribute?](#how-can-i-contribute)
- [Setting up your development machine](#setting-up-your-development-machine)
  - [Install system-level dependencies](#install-system-level-dependencies)
    - [Node.js, npm, pnpm](#nodejs-npm-pnpm)
    - [Git](#git)
    - [On Debian/Ubuntu](#on-debianubuntu)
    - [On Fedora](#on-fedora)
    - [On Windows](#on-windows)
  - [Clone repository with submodule](#clone-repository-with-submodule)
  - [Local caching of dependencies](#local-caching-of-dependencies)
  - [Install dependencies](#install-dependencies)
  - [Fix native modules to match current electron node version](#fix-native-modules-to-match-current-electron-node-version)
  - [Package recipe repository](#package-recipe-repository)
  - [Using Docker to build a linux-targetted packaged app](#using-docker-to-build-a-linux-targetted-packaged-app)
  - [Code Signing on a mac](#code-signing-on-a-mac)
  - [Start development app](#start-development-app)
  - [Styleguide](#styleguide)
    - [Git Commit Messages format](#git-commit-messages-format)
    - [Javascript Coding style-checker](#javascript-coding-style-checker)
- [Packaging](#packaging)
- [Release](#release)
  - [Nightly releases](#nightly-releases)
  - [Updating the code after a hiatus](#updating-the-code-after-a-hiatus)

<!-- /TOC -->

## Code of Conduct

This project and everyone participating in it is governed by the [Ferdium Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
Please report unacceptable behavior to [hello@ferdium.org](mailto:hello@ferdium.org).

## What should I know before I get started?

For the moment, Ferdium's development is only starting, aiming at releasing a 6.0.0 version with the rebranded assets and tooling upgrade completed.
You can join the Discord official chat here : https://discord.com/invite/xpNTzgKmHM.

## How can I contribute?

As a basic rule, before filing issues, feature requests or anything else : take a look at the existing issues and check if this has not already been reported by another user.
If so, engage in the already existing discussion.

## Setting up your development machine

### Install system-level dependencies

_Note:_ This list can likely get outdated. If so, please refer to the specific version of the [electronuserland builder](https://hub.docker.com/r/electronuserland/builder) that we use in our [Dockerfile](./Dockerfile).

#### Node.js, npm, pnpm

Please make sure you are conforming to the `engines` requirements used by the developers/contributors as specified in the [package.json file](./package.json#engines).

Currently, these are the combinations of system dependencies that work for MacOS/Linux/Windows:

```bash
node -v
v18.0.0
npm -v
8.7.0
pnpm -v
6.32.8
python -v
3.10.4
```

_Note:_ You can choose any version manager to manage multiple versions of `node` and `npm`. For eg, [nvm](https://github.com/nvm-sh/nvm) or [asdf](https://github.com/asdf-vm/asdf).

#### Git

The version [2.23.0](https://github.com/git-for-windows/git/releases/tag/v2.23.0.windows.1) for Git is working fine for development. You can then use the console from Git to do the development procedure.

#### On Debian/Ubuntu

```bash
apt-get update -y && apt-get install --no-install-recommends -y rpm ruby gem && gem install fpm --no-ri --no-rdoc --no-document
```

#### On Fedora

```bash
dnf install libX11-devel libXext-devel libXScrnSaver-devel libxkbfile-devel rpm
```

#### On Windows

Please make sure you have the following installed:

- Python 3 or higher (we recommend the latest version: [3.10.4](https://www.python.org/ftp/python/3.10.4/python-3.10.4-amd64.exe))
- Microsoft Visual Studio Build Tools (2019 or higher) - Only tested with 2019 so far.

### Clone repository with submodule

```bash
git clone https://github.com/ferdium/ferdium.git
cd ferdium
git submodule update --init --recursive --remote --rebase --force
```

It is important you execute the last command to get the required submodule (ferdium-recipes).

### Local caching of dependencies

Set these env vars into your profile (or if you use [direnv](https://direnv.net/), you can manage them via the respective `.envrc` file)

```bash
# On bash or equivalent
export ELECTRON_CACHE=$HOME/.cache/electron
export ELECTRON_BUILDER_CACHE=$HOME/.cache/electron-builder

# On Powershell
$env:CI = $true
$env:ELECTRON_CACHE = $HOME + '\.cache\electron'
$env:ELECTRON_BUILDER_CACHE = $HOME + '\.cache\electron-builder'
```

### Install dependencies

Run the following command to install all dependencies, and link sibling modules with Ferdium.

```bash
npm install
```

If you encounter the `gyp: No Xcode or CLT version` error on macOS at this step, please have a look [here](https://medium.com/flawless-app-stories/gyp-no-xcode-or-clt-version-detected-macos-catalina-anansewaa-38b536389e8d).

### Fix native modules to match current electron node version

```bash
npm run build
```

### Package recipe repository

Ferdium requires its recipes to be packaged before it can use it. When running Ferdium as a development instance, you'll need to package the local recipes before you can create any services inside Ferdium.

```bash
cd recipes && pnpm install && pnpm run package
```

### Using Docker to build a linux-targetted packaged app

```bash
docker build -t ferdium-package-`uname -m` .
```

The above will place all the built artifacts into the `/ferdium` folder within the image.

If you want to copy them outside of the image, simply mount a volume into a different location, and copy all files from `/ferdium` into the mounted folder (`/ferdium-out` in the example command below).

```bash
DATE=`date +"%Y-%b-%d-%H-%M"`
mkdir -p ~/Downloads/$DATE
docker run -e GIT_SHA=`git rev-parse --short HEAD` -v ~/Downloads/$DATE:/ferdium-out -it ferdium-package sh
# inside the container:
mv /ferdium/Ferdium-*.AppImage /ferdium-out/Ferdium-$GIT_SHA.AppImage
mv /ferdium/ferdium-*.tar.gz /ferdium-out/Ferdium-$GIT_SHA.tar.gz
mv /ferdium/ferdium-*.x86_64.rpm /ferdium-out/Ferdium-x86_64-$GIT_SHA.rpm
mv /ferdium/ferdium_*_amd64.deb /ferdium-out/Ferdium-amd64-$GIT_SHA.deb
mv /ferdium/ferdium-*.freebsd /ferdium-out/Ferdium-$GIT_SHA.freebsd
mv /ferdium/ferdium /ferdium-out/Ferdium-$GIT_SHA
mv /ferdium/latest-linux.yml /ferdium-out/latest-linux-$GIT_SHA.yml
```

### Code Signing on a mac

If you are building the packaged app (on a mac) for local testing, you can set this environment variable to bypass the code signing step during the packaging process (`npm run build`):

```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
```

Or else, if you want to self-sign on a mac with non-registered certificate (not for distribution of the resulting package), you can follow [this thread](https://github.com/electron/electron/issues/7476#issuecomment-356084754) and run this command:

```bash
codesign --deep --force --verbose --sign - node_modules/electron/dist/Electron.app
```

### Start development app

Run these two commands **simultaneously** in different terminals:

```bash
npm run dev
DEBUG=Ferdium:* npm run start
```

- Optionally, you can run both commands in one terminal with [concurrently](https://www.npmjs.com/package/concurrently):

```bash
DEBUG_COLORS=1 DEBUG=Ferdium:* npm run start:all-dev
```

Note: please prefer [`debug()`](https://github.com/visionmedia/debug) over `console.log()`.

### Styleguide

#### Git Commit Messages format

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- When only changing documentation, include `[ci skip]` in the commit description

#### Javascript Coding style-checker

- Please use `prettier` and the defined rules to maintain a consistent style

## Packaging

```bash
# On Unix
./scripts/build-unix.sh

# On Windows
.\scripts\build-windows.ps1 
```

Assets will be available in the `out` folder.

## Release

```bash
git checkout nightly && git pull -r
git checkout release
git merge --no-ff nightly --no-verify
# <manually resolve conflicts>
# <manually bump version with 'beta' name (if beta) in `package.json` and `package-lock.json`>
# <create commit>
# <create tag>
git push
```

This will automatically trigger the build, as part of which, a new, draft release will be created [here](https://github.com/ferdium/ferdium-app/releases/). Once all the assets are uploaded (19 assets in total), publish the release (you will need elevated permissions in GitHub for doing this). The last commit of the `release` branch will be tagged.

### Nightly releases

Nightly releases are automatically triggered every day ([details](https://github.com/ferdium/ferdium-app/pull/990)) and available in [ferdium/ferdium](https://github.com/ferdium/ferdium-app/releases). Maintainers still need to verify and manually publish the draft releases as pre-releases for now.

### Updating the code after a hiatus

Since we are making a lot of changes that involve restructuring the code as well as taking a hard look at the dependencies (including node versions), please remember to update them by running the appropriate command of your chosen package manager.
