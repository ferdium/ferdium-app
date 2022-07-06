import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, PropTypes as MobxPropTypes } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';
import { NavLink } from 'react-router-dom';

import injectSheet from 'react-jss';

import { mdiOpenInNew } from '@mdi/js';
import Button from '../../ui/button';
import Input from '../../ui/input/index';
import { H1, H2, H3 } from '../../ui/headline';
import SearchInput from '../../ui/SearchInput';
import Infobox from '../../ui/Infobox';
import RecipeItem from './RecipeItem';
import Loader from '../../ui/Loader';
import Appear from '../../ui/effects/Appear';
import { FERDIUM_SERVICE_REQUEST } from '../../../config';
import RecipePreview from '../../../models/RecipePreview';
import Icon from '../../ui/icon';

const messages = defineMessages({
  headline: {
    id: 'settings.recipes.headline',
    defaultMessage: 'Available services',
  },
  searchService: {
    id: 'settings.searchService',
    defaultMessage: 'Search service',
  },
  ferdiumPicksRecipes: {
    id: 'settings.recipes.ferdiumPicks',
    defaultMessage: 'Ferdium Picks',
  },
  allRecipes: {
    id: 'settings.recipes.all',
    defaultMessage: 'All services',
  },
  customRecipes: {
    id: 'settings.recipes.custom',
    defaultMessage: 'Custom Services',
  },
  nothingFound: {
    id: 'settings.recipes.nothingFound',
    defaultMessage:
      'Sorry, but no service matched your search term - but you can still probably add it using the "Custom Website" option. Please note that the website might show more services that have been added to Ferdium since the version that you are currently on. To get those new services, please consider upgrading to a newer version of Ferdium.',
  },
  servicesSuccessfulAddedInfo: {
    id: 'settings.recipes.servicesSuccessfulAddedInfo',
    defaultMessage: 'Service successfully added',
  },
  missingService: {
    id: 'settings.recipes.missingService',
    defaultMessage: 'Missing a service?',
  },
  customRecipeIntro: {
    id: 'settings.recipes.customService.intro',
    defaultMessage:
      'To add a custom service, copy the service recipe folder inside:',
  },
  openFolder: {
    id: 'settings.recipes.customService.openFolder',
    defaultMessage: 'Open folder',
  },
  openDevDocs: {
    id: 'settings.recipes.customService.openDevDocs',
    defaultMessage: 'Developer Documentation',
  },
  headlineCustomRecipes: {
    id: 'settings.recipes.customService.headline.customRecipes',
    defaultMessage: 'Custom 3rd Party Recipes',
  },
  headlineCommunityRecipes: {
    id: 'settings.recipes.customService.headline.communityRecipes',
    defaultMessage: 'Community 3rd Party Recipes',
  },
  headlineDevRecipes: {
    id: 'settings.recipes.customService.headline.devRecipes',
    defaultMessage: 'Your Development Service Recipes',
  },
});

const styles = {
  devRecipeIntroContainer: {
    textAlign: 'center',
    width: '100%',
    height: 'auto',
    margin: [40, 0],
  },
  path: {
    marginTop: 20,

    '& > div': {
      fontFamily:
        'SFMono-Regular,Consolas,Liberation Mono,Menlo,Courier,monospace',
    },
  },
  actionContainer: {
    '& button': {
      margin: [0, 10],
    },
  },
  devRecipeList: {
    marginTop: 20,
    height: 'auto',
  },
  proBadge: {
    marginLeft: '10px !important',
  },
};

class RecipesDashboard extends Component {
  static propTypes = {
    recipes: MobxPropTypes.arrayOrObservableArray.isRequired,
    customWebsiteRecipe: PropTypes.instanceOf(RecipePreview).isRequired,
    isLoading: PropTypes.bool.isRequired,
    hasLoadedRecipes: PropTypes.bool.isRequired,
    showAddServiceInterface: PropTypes.func.isRequired,
    searchRecipes: PropTypes.func.isRequired,
    resetSearch: PropTypes.func.isRequired,
    serviceStatus: MobxPropTypes.arrayOrObservableArray.isRequired,
    searchNeedle: PropTypes.string,
    recipeFilter: PropTypes.string,
    recipeDirectory: PropTypes.string.isRequired,
    openRecipeDirectory: PropTypes.func.isRequired,
    openDevDocs: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
  };

  static defaultProps = {
    searchNeedle: '',
    recipeFilter: 'all',
  };

  render() {
    const {
      recipes,
      customWebsiteRecipe,
      isLoading,
      hasLoadedRecipes,
      showAddServiceInterface,
      searchRecipes,
      resetSearch,
      serviceStatus,
      searchNeedle,
      recipeFilter,
      recipeDirectory,
      openRecipeDirectory,
      openDevDocs,
      classes,
    } = this.props;
    const { intl } = this.props;

    const communityRecipes = recipes.filter(r => !r.isDevRecipe);
    const devRecipes = recipes.filter(r => r.isDevRecipe);

    return (
      <div className="settings__main">
        <div className="settings__header">
          <H1>{intl.formatMessage(messages.headline)}</H1>
        </div>
        <div className="settings__body recipes">
          {serviceStatus.length > 0 && serviceStatus.includes('created') && (
            <Appear>
              <Infobox
                type="success"
                icon="checkbox-marked-circle-outline"
                dismissable
              >
                {intl.formatMessage(messages.servicesSuccessfulAddedInfo)}
              </Infobox>
            </Appear>
          )}
          <SearchInput
            placeholder={intl.formatMessage(messages.searchService)}
            onChange={e => searchRecipes(e)}
            onReset={() => resetSearch()}
            autoFocus
            throttle
          />
          <div className="recipes__navigation">
            <NavLink
              to="/settings/recipes"
              className={() =>
                recipeFilter === 'featured' ? 'badge badge--primary' : 'badge'
              }
              onClick={() => resetSearch()}
            >
              {intl.formatMessage(messages.ferdiumPicksRecipes)}
            </NavLink>
            <NavLink
              to="/settings/recipes/all"
              className={({ isActive }) =>
                isActive && recipeFilter === 'all' ? 'badge badge--primary' : 'badge'
              }
              onClick={() => resetSearch()}
            >
              {intl.formatMessage(messages.allRecipes)}
            </NavLink>
            <NavLink
              to="/settings/recipes/dev"
              className={({ isActive }) =>
                isActive && !searchNeedle ? 'badge badge--primary' : 'badge'
              }
              onClick={() => resetSearch()}
            >
              {intl.formatMessage(messages.customRecipes)}
            </NavLink>
            <a
              href={FERDIUM_SERVICE_REQUEST}
              target="_blank"
              className="link recipes__service-request"
              rel="noreferrer"
            >
              {intl.formatMessage(messages.missingService)}{' '}
              <Icon icon={mdiOpenInNew} />
            </a>
          </div>
          {/* )} */}
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {recipeFilter === 'dev' && (
                <>
                  <H2>{intl.formatMessage(messages.headlineCustomRecipes)}</H2>
                  <div className={classes.devRecipeIntroContainer}>
                    <p>{intl.formatMessage(messages.customRecipeIntro)}</p>
                    <Input
                      value={recipeDirectory}
                      className={classes.path}
                      showLabel={false}
                    />
                    <div className={classes.actionContainer}>
                      <Button
                        onClick={openRecipeDirectory}
                        buttonType="secondary"
                        label={intl.formatMessage(messages.openFolder)}
                      />
                      <Button
                        onClick={openDevDocs}
                        buttonType="secondary"
                        label={intl.formatMessage(messages.openDevDocs)}
                      />
                    </div>
                  </div>
                </>
              )}
              {recipeFilter === 'dev' && communityRecipes.length > 0 && (
                <H3>{intl.formatMessage(messages.headlineCommunityRecipes)}</H3>
              )}
              <div className="recipes__list">
                {communityRecipes.map(recipe => (
                  <RecipeItem
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() =>
                      showAddServiceInterface({ recipeId: recipe.id })
                    }
                  />
                ))}
              </div>
              {hasLoadedRecipes &&
                recipes.length === 0 &&
                recipeFilter !== 'dev' && (
                  <div className="align-middle settings__empty-state">
                    {customWebsiteRecipe && customWebsiteRecipe.id && (
                      <RecipeItem
                        key={customWebsiteRecipe.id}
                        recipe={customWebsiteRecipe}
                        onClick={() =>
                          showAddServiceInterface({
                            recipeId: customWebsiteRecipe.id,
                          })
                        }
                      />
                    )}
                    <p className="settings__empty-state-text">
                      {intl.formatMessage(messages.nothingFound)}
                    </p>
                  </div>
                )}
              {recipeFilter === 'dev' && devRecipes.length > 0 && (
                <div className={classes.devRecipeList}>
                  <H3>{intl.formatMessage(messages.headlineDevRecipes)}</H3>
                  <div className="recipes__list">
                    {devRecipes.map(recipe => (
                      <RecipeItem
                        key={recipe.id}
                        recipe={recipe}
                        onClick={() =>
                          showAddServiceInterface({ recipeId: recipe.id })
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
}

export default injectIntl(
  injectSheet(styles, { injectTheme: true })(observer(RecipesDashboard)),
);
