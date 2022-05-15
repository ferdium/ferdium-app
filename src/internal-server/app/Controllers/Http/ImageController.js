const Env = use('Env');

const path = require('path');
const fs = require('fs-extra');

class ImageController {
  async icon({ params, response }) {
    const { id } = params;

    const iconPath = path.join(Env.get('USER_PATH'), 'icons', id);
    if (!fs.existsSync(iconPath)) {
      return response.status(404).send({
        status: "Icon doesn't exist",
      });
    }

    return response.download(iconPath);
  }
}

module.exports = ImageController;
