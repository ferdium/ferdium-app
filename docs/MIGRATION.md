# Migrating account data

This guide is here to show you how to export your current Ferdi setup from the online server or from an accountless session for safe-keeping, backup or transferring to a new instance using only a browser.

Before getting into the details of using an online account vs accountless, let's quickly review what the differences are between the two of them:

## Using Ferdi with an Account

The main advantage of using Ferdi with an account is that you have your configuration data stored on a cloud - and thus, when moving to a different machine, once you login, all these configurations are applied to the Ferdi instance on your new machine.

**But**, if you use a Ferdi account, you need to reach their servers. If the servers are not accessible, you sadly have no other options for getting your data as there are no local copies. So it is advised to do this as soon as there's a chance - just to be safe.

## Using Ferdi without an account i.e. Accountless

Accountless instances have all the same functionality as account-based ones with the exception of multi-machine synchronization. If you don't intend to use this app on multiple machines with regularly changing settings and lists of services, there's no benefit to having an online account. Having a backup of your `export.ferdi-data` whenever you make changes to your setup, provides a similarly secure (albeit slower and manual alternative) to automatic syncing that doesn't rely on a server's constant availability.

## Exporting

Depending on where you have your account, you have to visit separate sites to retrieve it. This has no impact on your current instances. You can follow the next steps to access and export that data irrespective of which online server holds your data.

1. Have Ferdi running on your system. (Even if you are on the initial "Get started" page, these instructions will work.)
2. Go to `Help > Import/Export Configuration Data` which should open the corresponding url in your default browser.
3. Click on `export your data to a ".ferdi-data" file`.
4. Save the `export.ferdi-data` file to anywhere you'd like for safe-keeping/backup.

## Importing

1. Have Ferdium running on your system.
2. When you get to the screen that says "Get Started", go to `Help > Import/Export Configuration Data` which should open a local url in your default browser.
3. Click on `import your data from a ".ferdium-data" or ".ferdi-data" file`.
4. Using the File browser button, find the previously saved `export.ferdi-data` file on your system and click the "Import data" button.
5. Restart your application.

_Note:_

1. Setting up new instances or migrating to an accountless setup will require all services to be logged-in by hand again. This is because the session information only stays on your local machine - ever.
2. Importing data does not override the list of local services if you have any, but adds them to the current list. This is normal behavior. If you do not want to deal with duplicate instances of services, you can delete your pre-existing services prior to importing from the previously exported data file.
3. Due to current risks of losing access to Ferdi's services, it is ill-advised to use their servers in the future. You should setup your own server while you wait for official Ferdium solutions (if automatic syncing is important to you).
