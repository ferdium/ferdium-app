const Env = use('Env');

const { v4: uuid } = require('uuid');

const path = require('path');
const fs = require('fs-extra');

module.exports = async (icon) => {
  const iconsPath = path.join(Env.get('USER_PATH'), 'icons');
  await fs.ensureDir(iconsPath);

  // Generate new icon ID
  let iconId;
  do {
    iconId = uuid() + uuid();
  } while (fs.existsSync(path.join(iconsPath, iconId)));
  iconId = `${iconId}.${icon.extname}`;

  await icon.move(iconsPath, {
    name: iconId,
    overwrite: true,
  });
  return !icon.moved() ? '-1' : iconId;
};
