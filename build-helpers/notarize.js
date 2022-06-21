exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin' || process.env.CSC_IDENTITY_AUTO_DISCOVERY === 'false' || (process.env.GIT_BRANCH_NAME !== 'release' && process.env.GIT_BRANCH_NAME !== 'nightly')) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  // @ts-ignore global-require
  const { notarize } = require('electron-notarize');

  await notarize({
    appBundleId: 'org.ferdium.ferdium-app',
    appPath: `${appOutDir}/${appName}.app`,
    ascProvider: '55E9FPJ93P',
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEID_PASSWORD,
  });
};
