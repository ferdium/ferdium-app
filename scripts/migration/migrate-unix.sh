#!/bin/sh

echo -e "********************************************"
echo -e "      Ferdium User Data Migration Tool      "
echo -e "          WARNING: UNIX OS Only!            "
echo -e "********************************************"
echo -e "\n\nThis tool migrates your user data from Ferdi to Ferdium."
echo -e "Intended to be used on Linux or MacOS machine.\n\n"
read -p "Do you want to proceed? (y/N) " confirm

case "$confirm" in
    y|Y|[yY][eE][sS] ) echo -e "Starting...";;
    n|N|[nN][oO] ) exit 1;;
    * ) exit 1;;
esac

os_check=$(uname)
echo "Your OS is $os_check"

if [ $os_check == "Linux" ];then
  FERDI_PATH="$HOME/.config/Ferdi"
  FERDIUM_PATH="$HOME/.config/Ferdium"
elif [ $os_check == "Darwin" ];then
  FERDI_PATH="$HOME/Library/Application Support/Ferdi"
  FERDIUM_PATH="$HOME/Library/Application Support/Ferdium"
else
  echo "Your OS is not supported by this script"
  exit 1
fi

if [ -d "$FERDIUM_PATH" ]; then
    echo -e "\nPath $FERDIUM_PATH exist, making a backup\n"
    if ! mv -vf "$FERDIUM_PATH" "$FERDIUM_PATH.bak" 2> /dev/null ;then
        read -p "A previous backup already exists at $FERDIUM_PATH.bak. do you want to remove it? (y/N) " confirm
        echo
        case "$confirm" in
            y|Y|[yY][eE][sS] ) echo -e "Deleting...";;
            n|N|[nN][oO] ) exit 1;;
            * ) exit 1;;
        esac
        echo
        rm -rf "$FERDIUM_PATH.bak"
        mv -vf "$FERDIUM_PATH" "$FERDIUM_PATH.bak"
    fi
fi

if mv -vf "$FERDI_PATH" "$FERDIUM_PATH"; then
    echo -e "\nFiles exported succesfully"
else
    echo -e "\nERROR!"
    echo -e "No user data was found to be exported. Exiting..."
    exit 1
fi

if [ -f $FERDIUM_PATH/server.sqlite ];then
    echo -e "\n********************************************"
    echo -e "                 Success!                   "
    echo -e "********************************************"
else
    echo -e "\n********************************************\n"
    echo -e "WARNING: Your data was partially migrated!\n"
    echo -e "It was detected that your account is using Ferdi servers to sync your data."
    echo -e "Please, check this guide on how to export and import your data manually:"
    echo -e "https://github.com/ferdium/ferdi/blob/main/MIGRATION.md\n"
    echo -e "********************************************"
fi
