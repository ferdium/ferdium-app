// HACKTAG: Fix from https://github.com/electron-userland/electron-builder/issues/7256 to overcome issue from electron-builder for windows multi-arch builds
exports.default = async function (context) {
  delete process.env.GYP_MSVS_VERSION;
};
