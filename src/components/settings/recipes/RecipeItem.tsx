import { Component } from 'react';
import { observer } from 'mobx-react';

import RecipePreviewModel from '../../../models/RecipePreview';

type Props = {
  recipe: RecipePreviewModel;
  onClick: () => {};
};

class RecipeItem extends Component<Props> {
  render() {
    const { recipe, onClick } = this.props;

    return (
      <button type="button" className="recipe-teaser" onClick={onClick}>
        {recipe.isDevRecipe && (
          <span className="recipe-teaser__dev-badge">dev</span>
        )}
        <img src={recipe.icon} className="recipe-teaser__icon" alt="" />
        <span className="recipe-teaser__label">{recipe.name}</span>
        {recipe.aliases && recipe.aliases.length > 0 && (
          <span className="recipe-teaser__alias_label">
            {`Aliases: ${recipe.aliases.join(', ')}`}
          </span>
        )}
      </button>
    );
  }
}

export default observer(RecipeItem);
