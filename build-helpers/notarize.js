exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (
    electronPlatformName !== 'darwin' ||
    process.env.CSC_IDENTITY_AUTO_DISCOVERY === 'false' ||
    (process.env.GIT_BRANCH_NAME !== 'release' &&
      process.env.GIT_BRANCH_NAME !== 'nightly')
  ) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  // eslint-disable-next-line global-require
  const { notarize } = require('@electron/notarize');

  await notarize({
    appPath: `${appOutDir}/${appName}.app`,
    teamId: process.env.APPLE_TEAM_ID || '',
    appleId: process.env.APPLEID || '',
    appleIdPassword: process.env.APPLEID_PASSWORD || '',
  });
};
