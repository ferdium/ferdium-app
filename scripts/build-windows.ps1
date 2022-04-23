# INTRO:
# This file is used to build ferdium on windows.
# It also handles any corrupted node modules with the 'CLEAN' env var (set it to 'true' for cleaning)
# It will install the system dependencies except for node (which is still verified)
# I sometimes symlink my 'recipes' folder so that any changes that I need to do in it can also be committed and pushed
# This file can live anywhere in your PATH

$USERHOME = "${env:HOMEDRIVE}${env:HOMEPATH}"

$env:ELECTRON_CACHE = $USERHOME + '/.cache/electron'
$env:ELECTRON_BUILDER_CACHE = $USERHOME + '/.cache/electron-builder'
$env:CSC_IDENTITY_AUTO_DISCOVERY = $false

$env:CI = $true

# -----------------------------------------------------------------------------
#                  Utility functions

Function fail_with_docs {Param ($1)
  Write-Host "*************** FAILING ***************"
  Write-Host "$1"
  Write-Host ""
  Write-Host "Please read the developer documentation in CONTRIBUTING.md"
  exit 1
}

Function Test-CommandExists { Param ($command, $1)
  $oldPreference = $ErrorActionPreference
  $ErrorActionPreference = "stop"

  try {
    if(Get-Command $command){RETURN}
  } Catch {
    fail_with_docs $1
  }
  Finally {$ErrorActionPreference=$oldPreference}
}

# -----------------------------------------------------------------------------
#                  Checking the developer environment
# checking for installed programmes
Test-CommandExists node "Node is not installed"
Test-CommandExists npm "npm is not installed"
Test-CommandExists python "Python is not installed"
# NEEDS proper way to CHECK MSVS Tools

# Checking node.js version
$EXPECTED_NODE_VERSION = (cat .nvmrc)
$ACTUAL_NODE_VERSION = (node -v)

if ("v$EXPECTED_NODE_VERSION" -ne $ACTUAL_NODE_VERSION) {
  fail_with_docs "You are not running the expected version of node!
   expected: [v$EXPECTED_NODE_VERSION]
   actual  : [$ACTUAL_NODE_VERSION]"
}

# Checking npm version
$EXPECTED_NPM_VERSION = (Get-Content package.json | ConvertFrom-Json).engines.npm
$ACTUAL_NPM_VERSION = (npm -v)

if ($EXPECTED_NPM_VERSION -ne $ACTUAL_NPM_VERSION) {
  Write-Host "You are not running the expected version of npm!
   expected: [$EXPECTED_NPM_VERSION]
   actual  : [$ACTUAL_NPM_VERSION]"
  Write-Host "Changing version of to [$EXPECTED_NPM_VERSION]"
}

# Checking python version
$EXPECTED_PYTHON_VERSION = "3.10.4"
$ACTUAL_PYTHON_VERSION = (python --version).trim("Python ")

if ([System.Version]$ACTUAL_PYTHON_VERSION -le [System.Version]$EXPECTED_PYTHON_VERSION) {
  fail_with_docs "You are not running the expected version of Python!
   expected: [$EXPECTED_PYTHON_VERSION] or higher
   actual  : [$ACTUAL_PYTHON_VERSION]"
}

# NEEDS proper way to CHECK MSVS Tools
# Checking MSVS Tools through MSVS_VERSION
$EXPECTED_MSVST_VERSION = "2015"
$ACTUAL_MSVST_VERSION = (npm config get msvs_version)

if ([double]$ACTUAL_MSVST_VERSION -le [double]$EXPECTED_MSVST_VERSION) {
  fail_with_docs "You are not running the expected version of MSVS Tools!
   expected: [$EXPECTED_MSVST_VERSION] or higher
   actual  : [$ACTUAL_MSVST_VERSION]"
}
# -----------------------------------------------------------------------------

# Check if the 'recipes' folder is present either as a git submodule or a symbolic link
if (-not (Test-Path -Path "recipes/package.json" -PathType Leaf)) {
  fail_with_docs "'recipes' folder is missing or submodule has not been checked out"
}

if ($env:CLEAN -eq "true")
{
  $NPM_PATH = "$USERHOME\.npm"
  $NODE_GYP = "$USERHOME\.node-gyp"

  Write-Host "Cleaning!"
  npm cache clean --force
  Remove-Item -Path $NPM_PATH -Recurse -ErrorAction SilentlyContinue
  Remove-Item -Path $NODE_GYP -Recurse -ErrorAction SilentlyContinue

  if ( (Test-Path -Path ".\pnpm-lock.yaml") -and (Get-Command -ErrorAction Ignore -Type Application pnpm) )
  {
    $PNPM_STORE = "$USERHOME\.pnpm-store"
    $PNPM_STATE = "$USERHOME\.pnpm-state"

    pnpm store prune

    Remove-Item -Path $PNPM_STORE -Recurse
    Remove-Item -Path $PNPM_STATE -Recurse
  }

  git -C recipes clean -fxd
  git clean -fxd # Note: This will blast away the 'recipes' folder if you have symlinked it
}

# Ensure that the system dependencies are at the correct version
$EXPECTED_PNPM_VERSION = (Get-Content recipes\package.json | ConvertFrom-Json).engines.pnpm

npm i -gf npm@$EXPECTED_NPM_VERSION
npm i -gf pnpm@$EXPECTED_PNPM_VERSION

# This is useful if we move from 'npm' to 'pnpm' for the main repo as well
if ((Test-Path -Path ".\pnpm-lock.yaml") -and (Get-Command -ErrorAction Ignore -Type Application pnpm))
{
  $BASE_CMD="pnpm"
  $env:EXEC_CMD="pnpm dlx"
}
else
{
  $BASE_CMD="npm"
  $env:EXEC_CMD="npx"
}

# Now the meat.....
& $BASE_CMD i
& $BASE_CMD run prepare-code

# Check if the 'recipes' folder is present either as a git submodule or a symbolic link
if (-not (Test-Path -Path ".\recipes\package.json"))
{
  try {
    git submodule update --init --recursive --remote --rebase --force
  } catch {
    Write-Host "FAILING since 'recipes' folder/submodule has not been checked out"
    exit 1
  }
}

# Note: 'recipes' is already using only pnpm - can switch to $BASE_CMD AFTER both repos are using pnpm
Push-Location recipes
pnpm i
pnpm run package
Pop-Location

$TARGET_ARCH="x64"
& $BASE_CMD run build -- --$TARGET_ARCH --dir

Write-Host "*************** App successfully built! ***************"

# Final check to ensure that the version built is the same as the latest commit
$VERSION_BUILT_HASH = (Get-Content "build/buildInfo.json" | ConvertFrom-Json).gitHashShort
$GIT_BUILT_HASH = (git rev-parse --short HEAD)

if ($VERSION_BUILT_HASH -ne $GIT_BUILT_HASH)
{
  Write-Host "The built version is not on the latest commit!"
  Write-Host "  latest commit : [$GIT_BUILT_HASH]"
  Write-Host "  actual build  : [$VERSION_BUILT_HASH]"
  exit 1
}

git --no-pager log -1
