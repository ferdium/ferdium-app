const Env = use('Env');

const path = require('node:path');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');

class ImageController {
  async icon({ params, response }) {
    let { id } = params;

    id = sanitize(id);
    if (id === '') {
      return response.status(404).send({
        status: "Icon doesn't exist",
      });
    }

    const iconPath = path.join(Env.get('USER_PATH'), 'icons', id);

    try {
      await fs.access(iconPath);
    } catch (error) {
      console.log(error);
      // File not available.
      return response.status(404).send({
        status: "Icon doesn't exist",
      });
    }

    return response.download(iconPath);
  }
}

module.exports = ImageController;
