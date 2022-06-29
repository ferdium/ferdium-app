# INTRO:
# This file is used to build ferdium on windows.
# It also handles any corrupted node modules with the 'CLEAN' env var (set it to 'true' for cleaning)
# It will install the system dependencies except for node (which is still verified)
# I sometimes symlink my 'recipes' folder so that any changes that I need to do in it can also be committed and pushed independently
# This file can live anywhere in your PATH

$USERHOME = "${env:HOMEDRIVE}${env:HOMEPATH}"

$env:ELECTRON_CACHE = "$USERHOME\.cache\electron"
$env:ELECTRON_BUILDER_CACHE = "$USERHOME\.cache\electron-builder"
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
# Check for installed programmes
Test-CommandExists node "Node is not installed"
Test-CommandExists npm "npm is not installed"
# TODO: Needs proper way to check MSVS Build Tools

# Check node version
$EXPECTED_NODE_VERSION = (cat .nvmrc)
$ACTUAL_NODE_VERSION = (node -v)
if ("v$EXPECTED_NODE_VERSION" -ne $ACTUAL_NODE_VERSION) {
  fail_with_docs "You are not running the expected version of node!
    expected: [v$EXPECTED_NODE_VERSION]
    actual  : [$ACTUAL_NODE_VERSION]"
}

# Check if the 'recipes' folder is present either as a git submodule or a symbolic link
if (-not (Test-Path -Path recipes\package.json -PathType Leaf)) {
  fail_with_docs "'recipes' folder is missing or submodule has not been checked out"
}

# This log statement is only to remind me which 'recipes' folder I am using (symlink or git submodule)
# TODO: Implement this

# -----------------------------------------------------------------------------
# If you are moving to a new version of node or any other system dependency, then cleaning is recommended
# so that there's no irregular results due to cached modules
if ($env:CLEAN -eq "true")
{
  $NPM_PATH = "$USERHOME\AppData\Roaming\npm\node_modules"
  $NPM_CACHE1_PATH = "$USERHOME\AppData\Local\npm-cache"
  $NPM_CACHE2_PATH = "$USERHOME\AppData\Roaming\npm-cache"
  $ELECTRON_GYP = "$USERHOME\.electron-gyp"

  Write-Host "Cleaning!"

  if ( (Test-Path -Path ".\pnpm-lock.yaml") -and (Get-Command -ErrorAction Ignore -Type Application pnpm) )
  {
    $PNPM_STORE = "$USERHOME\.pnpm-store"
    $PNPM_STATE = "$USERHOME\.pnpm-state"

    pnpm store prune

    Remove-Item -Path $PNPM_STORE -Recurse -ErrorAction SilentlyContinue
    Remove-Item -Path $PNPM_STATE -Recurse -ErrorAction SilentlyContinue
  }

  npm cache clean --force
  Remove-Item -Path $NPM_PATH -Recurse -ErrorAction SilentlyContinue
  Remove-Item -Path $NPM_CACHE1_PATH -Recurse -ErrorAction SilentlyContinue
  Remove-Item -Path $NPM_CACHE2_PATH -Recurse -ErrorAction SilentlyContinue
  Remove-Item -Path $ELECTRON_GYP -Recurse -ErrorAction SilentlyContinue

  git -C recipes clean -fxd # Clean recipes folder/submodule
  git clean -fxd            # Note: This will blast away the 'recipes' folder if you have symlinked it
}

# -----------------------------------------------------------------------------
# Ensure that the system dependencies are at the correct version - fail if not
# TODO: Needs proper way to check MSVS Tools
# Check MSVS Tools through MSVS_VERSION
$EXPECTED_MSVST_VERSION = "2015"
$ACTUAL_MSVST_VERSION = (npm config get msvs_version)
if ([double]$ACTUAL_MSVST_VERSION -ne [double]$EXPECTED_MSVST_VERSION) {
  fail_with_docs "You are not running the expected version of MSVS Tools!
    expected: [$EXPECTED_MSVST_VERSION]
    actual  : [$ACTUAL_MSVST_VERSION]"
}

# -----------------------------------------------------------------------------
# Ensure that the system dependencies are at the correct version - recover if not
# Check npm version
$EXPECTED_NPM_VERSION = (Get-Content package.json | ConvertFrom-Json).engines.npm
$ACTUAL_NPM_VERSION = (npm -v)
if ($EXPECTED_NPM_VERSION -ne $ACTUAL_NPM_VERSION) {
  Write-Host "You are not running the expected version of npm!
    expected: [$EXPECTED_NPM_VERSION]
    actual  : [$ACTUAL_NPM_VERSION]"
  Write-Host "Changing version of npm to [$EXPECTED_NPM_VERSION]"
  npm i -gf npm@$EXPECTED_NPM_VERSION
}

# Check pnpm version
$EXPECTED_PNPM_VERSION = (Get-Content recipes\package.json | ConvertFrom-Json).engines.pnpm
$ACTUAL_PNPM_VERSION = Get-Command pnpm --version -ErrorAction SilentlyContinue  # in case the pnpm executable itself is not present
if ($ACTUAL_PNPM_VERSION -ne $EXPECTED_PNPM_VERSION) {
  npm i -gf pnpm@$EXPECTED_PNPM_VERSION
}

# -----------------------------------------------------------------------------
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

# -----------------------------------------------------------------------------
Write-Host "*************** Building recipes ***************"
# Note: 'recipes' is already using only pnpm - can switch to $BASE_CMD AFTER both repos are using pnpm
Push-Location recipes
pnpm i
pnpm package
Pop-Location

# -----------------------------------------------------------------------------
Write-Host "*************** Building app ***************"
if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") {
    $TARGET_ARCH="arm64"
}
else
{
    $TARGET_ARCH="x64"
}
& $BASE_CMD run build -- --$TARGET_ARCH --dir

Write-Host "*************** App successfully built! ***************"

# Final check to ensure that the version built is the same as the latest commit
$VERSION_BUILT_HASH = (Get-Content build\buildInfo.json | ConvertFrom-Json).gitHashShort
$GIT_BUILT_HASH = (git rev-parse --short HEAD)
if ($VERSION_BUILT_HASH -ne $GIT_BUILT_HASH)
{
  Write-Host "The built version is not on the latest commit!"
  Write-Host "  latest commit : [$GIT_BUILT_HASH]"
  Write-Host "  actual build  : [$VERSION_BUILT_HASH]"
  exit 1
}
