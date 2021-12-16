exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin' || process.env.SKIP_NOTARIZATION === 'true' || (process.env.GIT_BRANCH_NAME !== 'release' && process.env.GIT_BRANCH_NAME !== 'nightly')) {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  // @ts-ignore global-require
  const { notarize } = require('electron-notarize');

  await notarize({
    appBundleId: 'com.kytwb.ferdi',
    appPath: `${appOutDir}/${appName}.app`,
    ascProvider: 'B6J9X9DWFL',
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEID_PASSWORD,
  });
};
