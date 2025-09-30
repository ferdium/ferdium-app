import { observer } from 'mobx-react';
import { Component, MouseEventHandler } from 'react';
import {
  type WrappedComponentProps,
  injectIntl,
} from 'react-intl';
import { getLocalizedRecipeName } from '../../../helpers/recipe-helpers';
import RecipePreview from '../../../models/RecipePreview';

interface IProps extends WrappedComponentProps {
  recipe: RecipePreview;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

@observer
class RecipeItem extends Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { recipe, onClick, intl } = this.props;

    return (
      <button type="button" className="recipe-teaser" onClick={onClick}>
        {recipe.isDevRecipe && (
          <span className="recipe-teaser__dev-badge">dev</span>
        )}
        <img src={recipe.icons?.svg} className="recipe-teaser__icon" alt="" />
        <span className="recipe-teaser__label">
          {getLocalizedRecipeName(recipe.id, recipe.name, intl)}
        </span>
        {recipe.aliases && recipe.aliases.length > 0 && (
          <span className="recipe-teaser__alias_label">
            {`Aliases: ${recipe.aliases.join(', ')}`}
          </span>
        )}
      </button>
    );
  }
}

export default injectIntl(RecipeItem);
