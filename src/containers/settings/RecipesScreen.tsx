import { readJsonSync } from 'fs-extra';
import { type IReactionDisposer, autorun } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Component, type ReactElement } from 'react';

import type { Params } from 'react-router-dom';
import type { StoresProps } from '../../@types/ferdium-components.types';
import RecipesDashboard from '../../components/settings/recipes/RecipesDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import withParams from '../../components/util/WithParams';
import { CUSTOM_WEBSITE_RECIPE_ID, FERDIUM_DEV_DOCS } from '../../config';
import { userDataRecipesPath } from '../../environment-remote';
import { communityRecipesStore } from '../../features/communityRecipes';
import { asarRecipesPath } from '../../helpers/asar-helpers';
import { openPath } from '../../helpers/url-helpers';
import type Recipe from '../../models/Recipe';
import RecipePreview from '../../models/RecipePreview';

interface IProps extends Partial<StoresProps> {
  params: Params;
}

interface IState {
  needle: string | null;
  currentFilter: string;
}

@inject('stores', 'actions')
@observer
class RecipesScreen extends Component<IProps, IState> {
  autorunDisposer: IReactionDisposer | null = null;

  customRecipes: Recipe[] = [];

  constructor(props: IProps) {
    super(props);

    this.customRecipes = readJsonSync(asarRecipesPath('all.json'));
    this.state = {
      needle: null,
      currentFilter: 'featured',
    };
  }

  componentDidMount(): void {
    this.autorunDisposer = autorun(() => {
      const { filter } = this.props.params;
      const { currentFilter } = this.state;

      if (filter === 'all' && currentFilter !== 'all') {
        this.setState({ currentFilter: 'all' });
      } else if (filter === 'featured' && currentFilter !== 'featured') {
        this.setState({ currentFilter: 'featured' });
      } else if (filter === 'dev' && currentFilter !== 'dev') {
        this.setState({ currentFilter: 'dev' });
      }
    });
  }

  componentWillUnmount(): void {
    this.props.stores!.services.resetStatus();

    if (typeof this.autorunDisposer === 'function') {
      this.autorunDisposer();
    }
  }

  searchRecipes(needle: string | null): void {
    if (needle === '') {
      this.resetSearch();
    } else {
      const { search } = this.props.actions!.recipePreview;
      this.setState({ needle });
      search({ needle });
    }
  }

  _sortByName(recipe1, recipe2): number {
    if (recipe1.name.toLowerCase() < recipe2.name.toLowerCase()) {
      return -1;
    }
    if (recipe1.name.toLowerCase() > recipe2.name.toLowerCase()) {
      return 1;
    }
    return 0;
  }

  prepareRecipes(recipes: RecipePreview[]): RecipePreview[] {
    return (
      recipes
        // Filter out duplicate recipes
        .filter((recipe, index, self) => {
          const ids = self.map(rec => rec.id);
          return ids.indexOf(recipe.id) === index;

          // Sort alphabetically
        })
        .sort(this._sortByName)
    );
  }

  // Create an array of RecipePreviews from an array of recipe objects
  createPreviews(recipes: Recipe[]) {
    return recipes.map((recipe: any) => new RecipePreview(recipe));
  }

  resetSearch(): void {
    this.setState({ needle: null, currentFilter: 'featured' });
  }

  render(): ReactElement {
    const { recipePreviews, recipes, services } = this.props.stores!;
    const { app: appActions, service: serviceActions } = this.props.actions!;
    const filter = this.state.currentFilter;

    let recipeFilter;

    if (filter === 'all') {
      recipeFilter = this.prepareRecipes([
        ...recipePreviews.all,
        ...this.createPreviews(this.customRecipes),
      ]);
    } else if (filter === 'dev') {
      recipeFilter = communityRecipesStore.communityRecipes;
    } else {
      recipeFilter = recipePreviews.featured;
    }
    recipeFilter = [...recipeFilter].sort(this._sortByName);

    const { needle } = this.state;
    const allRecipes =
      needle === null
        ? recipeFilter
        : this.prepareRecipes([
            // All search recipes from server
            ...recipePreviews.searchResults,
            // All search recipes from local recipes
            ...this.createPreviews(
              this.customRecipes.filter(
                (recipe: Recipe) =>
                  recipe.name.toLowerCase().includes(needle.toLowerCase()) ||
                  (recipe.aliases || []).some(alias =>
                    alias.toLowerCase().includes(needle.toLowerCase()),
                  ),
              ),
            ),
          ]).sort(this._sortByName);

    const customWebsiteRecipe = recipePreviews.all.find(
      service => service.id === CUSTOM_WEBSITE_RECIPE_ID,
    );

    const isLoading =
      recipePreviews.featuredRecipePreviewsRequest.isExecuting ||
      recipePreviews.allRecipePreviewsRequest.isExecuting ||
      recipes.installRecipeRequest.isExecuting ||
      recipePreviews.searchRecipePreviewsRequest.isExecuting;

    const recipeDirectory = userDataRecipesPath('dev');

    return (
      <ErrorBoundary>
        <RecipesDashboard
          recipes={allRecipes}
          customWebsiteRecipe={customWebsiteRecipe}
          isLoading={isLoading}
          hasLoadedRecipes={
            recipePreviews.featuredRecipePreviewsRequest.wasExecuted
          }
          showAddServiceInterface={serviceActions.showAddServiceInterface}
          searchRecipes={e => this.searchRecipes(e)}
          resetSearch={() => this.resetSearch()}
          searchNeedle={this.state.needle}
          serviceStatus={services.actionStatus}
          recipeFilter={filter}
          recipeDirectory={recipeDirectory}
          openRecipeDirectory={() => openPath(recipeDirectory)}
          openDevDocs={() =>
            appActions.openExternalUrl({ url: FERDIUM_DEV_DOCS })
          }
        />
      </ErrorBoundary>
    );
  }
}

export default withParams(RecipesScreen);
