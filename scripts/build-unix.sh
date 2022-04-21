#!/bin/bash

# INTRO:
# This file is used to build ferdium on both x64 and arm-based macos. It also handles any corrupted node modules with the 'CLEAN' env var (set it to 'true' for cleaning)
# It will install the system dependencies except for node (which is still verified)
# I sometimes symlink my 'recipes' folder so that any changes that I need to do in it can also be committed and pushed
# This file can live anywhere in your PATH

# Please remember that these are tested only on macos for now

set -e

export CI=true

EXPECTED_NODE_VERSION=$(cat .nvmrc)
ACTUAL_NODE_VERSION=$(node -v)
if [ "v$EXPECTED_NODE_VERSION" != "$ACTUAL_NODE_VERSION" ]; then
  echo "You are not running the expected version of node!"
  echo "  expected: [v$EXPECTED_NODE_VERSION]"
  echo "  actual  : [$ACTUAL_NODE_VERSION]"
  exit 1
fi

# If you are moving to a new version of node or any other system dependency, then cleaning is recommended so that there's no irregular results due to cached modules
if [ "$CLEAN" == "true" ]; then
  echo "Cleaning!!!!!!"
  npm cache clean --force
  rm -rf ~/.npm ~/.node-gyp ~/.asdf/installs/nodejs/*/.npm/
  if [[ -s 'pnpm-lock.yaml' ]]; then
    pnpm store prune || true # in case the pnpm executable itself is not present
    rm -rf ~/.pnpm-store ~/.pnpm-state
  fi
  git -C recipes clean -fxd
  git clean -fxd # Note: This will blast away the 'recipes' folder if you have symlinked it
else
  echo "SKIP Cleaning!!!"
fi

# If 'asdf' is installed, reshim for new nodejs if necessary
type asdf &>/dev/null 2>&1 && asdf reshim nodejs

# Ensure that the system dependencies are at the correct version
npm i -gf npm@8.7.0
npm i -gf pnpm@6.32.8
# npm i -gf node-gyp@9.0.0

# If 'asdf' is installed, reshim for new nodejs if necessary
type asdf &>/dev/null 2>&1 && asdf reshim nodejs

# This is useful if we move from 'npm' to 'pnpm' for the main repo as well
if [[ -s 'pnpm-lock.yaml' ]]; then
  BASE_CMD=pnpm
  EXEC_CMD="pnpm dlx"
else
  BASE_CMD=npm
  EXEC_CMD="npx"
fi

# Now the meat.....
$BASE_CMD i
$BASE_CMD run prepare-code

# Check if the 'recipes' folder is present either as a git submodule or a symbolic link (package.json is present in recipes folder)
if ! [ -f "recipes/package.json" ]; then
  echo "FAILING since 'recipes' folder/submodule has not been checked out"
  exit 1
fi

# This log statement is only to remind me which 'recipes' folder I am using (symlink or git submodule)
if [[ -L recipes ]]; then
  echo "**** CONTINUING for 'recipes' symlinked"
else
  echo "**** CONTINUING for 'recipes' submodule"
fi
# Note: 'recipes' is already using only pnpm - can switch to $BASE_CMD AFTER both repos are using pnpm
cd recipes && pnpm i && pnpm run package && cd ..

# Since I am building on a mac, and only interested in the Ferdium.app artefact....
arch=$(uname -m)
if [[ $arch =~ "arm" ]]; then
  TARGET_ARCH=arm64
else
  TARGET_ARCH=x64
fi
$BASE_CMD run build -- -m --$TARGET_ARCH --dir

# Final check to ensure that the version built is the same as the latest commit
bat build/buildInfo.json
git log -1
