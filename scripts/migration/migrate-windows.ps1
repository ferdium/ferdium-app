Write-Host "********************************************"
Write-Host "      Ferdium User Data Migration Tool      "
Write-Host "         WARNING: Windows OS Only!          "
Write-Host "********************************************"
Write-Host ""
Write-Host ""
Write-Host "This tool migrates your user data from Ferdi to Ferdium."
Write-Host ""
Write-Host ""
$confirmation = Read-host "Do you want to proceed? (Y/N)"

Switch($confirmation)
{
    default {exit 1}
    "No" {exit 1}
    "N" {exit 1}
    "Yes" {Write-Host "Starting..."}
    "Y" {Write-Host "Starting..."}
}


$FERDI_PATH=$env:APPDATA + "/Ferdi"
$FERDIUM_PATH=$env:APPDATA + "/Ferdium"

try {
    Rename-Item -Force -Path $FERDI_PATH -NewName Ferdium -ErrorAction 'Stop'
} catch {
    Write-Host ""
    Write-Host "ERROR!"
    Write-Host "No user data was found. Exiting..."
    exit 1
}

if (-not (Test-Path -Path $FERDIUM_PATH/server.sqlite)) {
    Write-Host ""
    Write-Host "********************************************"
    Write-Host ""
    Write-Host "WARNING: Your data was partially migrated!"
    Write-Host ""
    Write-Host "It was detected that your account is using Ferdi servers to sync your data."
    Write-Host "Please, check this guide on how to export and import your data manually:"
    Write-Host "https://github.com/ferdium/ferdi/blob/main/docs/MIGRATION.md"
    Write-Host ""
    Write-Host "********************************************"

} else {
    Write-Host ""
    Write-Host ""
    Write-Host "********************************************"
    Write-Host "                 Success!                   "
    Write-Host "********************************************"
}

