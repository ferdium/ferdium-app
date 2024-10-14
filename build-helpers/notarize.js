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
    tool: 'notarytool',
    appPath: `${appOutDir}/${appName}.app`,
    teamId: '55E9FPJ93P',
    appleId: process.env.APPLEID || '',
    appleIdPassword: process.env.APPLEID_PASSWORD || '',
  });
};
