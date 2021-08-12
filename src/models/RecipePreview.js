// @flow

export default class RecipePreview {
  id = '';

  name = '';

  icon = '';

  featured = false;

  constructor(data) {
    if (!data.id) {
      throw Error('RecipePreview requires Id');
    }

    Object.assign(this, data);
  }
}
