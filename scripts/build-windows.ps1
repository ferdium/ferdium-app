# INTRO:
# This file is used to build ferdium on both x64 and arm-based macos. It also handles any corrupted node modules with the 'CLEAN' env var (set it to 'true' for cleaning)
# It will install the system dependencies except for node (which is still verified)
# I sometimes symlink my 'recipes' folder so that any changes that I need to do in it can also be committed and pushed
# This file can live anywhere in your PATH

# THANK YOU FerFig!!

#CHECK PYTHON
#CHECK NODE.JS
#CHECK NPM
#CHECK MSVS_VERSION and MSVS Tools


$USERHOME = "${env:HOMEDRIVE}${env:HOMEPATH}"

$env:ELECTRON_CACHE = $USERHOME + '/.cache/electron'
$env:ELECTRON_BUILDER_CACHE = $USERHOME + '/.cache/electron-builder'
$env:CSC_IDENTITY_AUTO_DISCOVERY = $false

$env:CI = $true

$EXPECTED_NODE_VERSION = (Get-Content .\.nvmrc)
$ACTUAL_NODE_VERSION = (node -v)

if ( "v$EXPECTED_NODE_VERSION" -ne $ACTUAL_NODE_VERSION)
{
    Write-Host "You are not running the expected version of node!"
    Write-Host "  expected: [v$EXPECTED_NODE_VERSION]"
    Write-Host "  actual  : [$ACTUAL_NODE_VERSION]"
    exit 1
}

if ( $env:CLEAN -eq "true" )
{
    $NPM_PATH = "$USERHOME\.npm"
    $NODE_GYP = "$USERHOME\.node-gyp"

    Write-Host "Cleaning!"
    npm cache clean --force
    Remove-Item -Path $NPM_PATH -Recurse
    Remove-Item -Path $NODE_GYP -Recurse

    if ( Test-Path -Path ".\pnpm-lock.yaml" -and (Get-Command -ErrorAction Ignore -Type Application pnpm) )
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
npm i -gf npm@8.7.0
npm i -gf pnpm@6.32.9

# This is useful if we move from 'npm' to 'pnpm' for the main repo as well
if ( (Test-Path -Path ".\pnpm-lock.yaml") -and (Get-Command -ErrorAction Ignore -Type Application pnpm) )
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
Set-Location recipes
pnpm i
pnpm run package
Set-Location ..

$TARGET_ARCH="x64"
& $BASE_CMD run build -- --$TARGET_ARCH --dir

# Final check to ensure that the version built is the same as the latest commit
Get-Content "build/buildInfo.json" | ConvertFrom-Json
git log -1