const { convertToJSON } = require('../../jsUtils');
const { ferdiumVersion } = require('../../environment-remote');

/**
 * Migrate server database to work with current Ferdium version
 */
const Database = use('Database');
const User = use('App/Models/User');

const migrateLog = text => {
  console.log('\u001B[36m%s\u001B[0m', 'Ferdium Migration:', '\u001B[0m', text);
};

module.exports = async () => {
  migrateLog('🧙‍  Running database migration wizard');

  // Make sure user table exists
  await Database.raw(
    'CREATE TABLE IF NOT EXISTS `users` (`id` integer not null primary key autoincrement, `settings` text, `created_at` datetime, `updated_at` datetime);',
  );

  const user = await User.find(1);
  let settings;
  if (user) {
    settings = convertToJSON(user.settings);
  } else {
    migrateLog("🎩  Migrating from old Ferdium version as user doesn't exist");

    // Create new user
    await Database.raw('INSERT INTO  "users" ("id") VALUES (\'1\');');
  }

  if (
    !settings ||
    !settings.db_version ||
    settings.db_version !== ferdiumVersion
  ) {
    const srcVersion = settings?.db_version || '5.4.0-beta.2';
    migrateLog(`🔮  Migrating table from ${srcVersion} to ${ferdiumVersion}`);

    // Migrate database to current Ferdium version
    // Currently no migrations

    // Update version number in database
    if (!settings) settings = {};
    settings.db_version = ferdiumVersion;
    const newUser = await User.find(1); // Fetch user again as we might have only just created it
    newUser.settings = JSON.stringify(settings);
    await newUser.save();
  } else {
    migrateLog('🔧  Nothing to migrate, already on the newest version');
  }
};
