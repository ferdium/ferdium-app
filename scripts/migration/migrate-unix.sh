#!/bin/bash

set -e

echo "********************************************"
echo "      Ferdium User Data Migration Tool      "
echo "          WARNING: UNIX OS Only!            "
echo "********************************************"
echo "\n\nThis tool migrates your user data from Ferdi to Ferdium."
echo "Intended to be used on Linux or MacOS machine.\n\n"
read -p "Do you want to proceed? (y/N) " confirm

case "$confirm" in
  y|Y|[yY][eE][sS] ) echo "Starting...";;
  n|N|[nN][oO] ) exit 1;;
  * ) exit 1;;
esac

os_check=$(uname)

if [ $os_check == "Linux" ]; then
  echo "Your OS is: Linux"
  BASE_PATH="$HOME/.config"
elif [ $os_check == "Darwin" ]; then
  echo "Your OS is: MacOS"
  BASE_PATH="$HOME/Library/Application Support"
else
  echo "Your OS is not supported by this script"
  exit 1
fi

FERDI_PATH="$BASE_PATH/Ferdi"
FERDIUM_PATH="$BASE_PATH/Ferdium2"

if [ -d "$FERDIUM_PATH" ]; then
  echo "\nPath $FERDIUM_PATH exist, making a backup\n"
  if ! mv -vf "$FERDIUM_PATH" "$FERDIUM_PATH.bak" 2> /dev/null ; then
    read -p "A previous backup already exists at $FERDIUM_PATH.bak. do you want to remove it? (y/N) " confirm
    echo
    case "$confirm" in
      y|Y|[yY][eE][sS] ) echo "Deleting...";;
      n|N|[nN][oO] ) exit 1;;
      * ) exit 1;;
    esac
    echo
    rm -rf "$FERDIUM_PATH.bak"
    mv -vf "$FERDIUM_PATH" "$FERDIUM_PATH.bak"
  fi
fi

if mv -vf "$FERDI_PATH" "$FERDIUM_PATH"; then
  echo "\nFiles exported succesfully"
else
  echo "\nERROR!"
  echo "No user data was found to be exported. Exiting..."
  exit 1
fi

if [ -f "$FERDIUM_PATH/server.sqlite" ]; then
  echo "\n********************************************"
  echo "                 Success!                   "
  echo "********************************************"
else
  echo "\n********************************************\n"
  echo "WARNING: Your data was partially migrated!\n"
  echo "It was detected that your account is using Ferdi servers to sync your data."
  echo "Please, check this guide on how to export and import your data manually:"
  echo "https://github.com/ferdium/ferdi/blob/main/MIGRATION.md\n"
  echo "********************************************"
fi
