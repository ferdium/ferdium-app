const fs = require("fs");
const path = require("path");
exports.default = async function (context) {
  // HACKTAG: Fix to overcome https://github.com/electron-userland/electron-builder/issues/7256 from electron-builder for windows multi-arch builds
  delete process.env.GYP_MSVS_VERSION;

  // CRAZY HACKTAG: Fix to overcome https://github.com/electron/rebuild/issues/546 from electron-rebuild
  /*
  1. Finds sqlite3/package.json
  2. replaces napi_build_version with 6 //current used one
  3. removes napi_versions (if present it expected napi_build_version to be present in modulePath)
   */
  const filePath = path.join(process.cwd(), "build", "node_modules", "sqlite3", "package.json");

  //This is to enfore that it happens only during rebuild.
  if(fs.existsSync(filePath)) {
    const sqlLite = require(filePath);
    Object.keys(sqlLite.binary).forEach(key => {
      let value = sqlLite.binary[key];
      if(typeof value === 'string') {
        value = value.replace("{napi_build_version}", 6)
        sqlLite.binary[key] = value
      }
    })
    delete sqlLite.binary["napi_versions"]
    fs.writeFileSync(filePath, JSON.stringify(sqlLite))
  }
};
