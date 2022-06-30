import { readJsonSync } from 'fs-extra';
import { Component, ReactElement } from 'react';
import { autorun, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';

import Recipe from '../../models/Recipe';
import { StoresProps } from '../../@types/ferdium-components.types';
import RecipesDashboard from '../../components/settings/recipes/RecipesDashboard';
import ErrorBoundary from '../../components/util/ErrorBoundary';
import { CUSTOM_WEBSITE_RECIPE_ID, FRANZ_DEV_DOCS } from '../../config';
import { userDataRecipesPath } from '../../environment-remote';
import { asarRecipesPath } from '../../helpers/asar-helpers';
import { communityRecipesStore } from '../../features/communityRecipes';
import RecipePreview from '../../models/RecipePreview';
import { openPath } from '../../helpers/url-helpers';

interface RecipesScreenProps extends StoresProps {
  // params: {
  //   filter?: string | null;
  // };
}

class RecipesScreen extends Component<RecipesScreenProps> {
  state: {
    needle: string | null;
    currentFilter: string;
  } = {
    needle: null,
    currentFilter: 'featured',
  };

  params: {
    filter?: string | null;
  };

  autorunDisposer: IReactionDisposer | null = null;

  customRecipes: Recipe[] = [];

  constructor(props: RecipesScreenProps) {
    super(props);

    this.params = {
      // @ts-ignore
      filter: props.match?.params?.filter,
    };

    this.customRecipes = readJsonSync(asarRecipesPath('all.json'));
  }

  componentDidMount(): void {
    this.autorunDisposer = autorun(() => {
      const { filter } = this.params;
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
    this.props.stores.services.resetStatus();

    if (typeof this.autorunDisposer === 'function') {
      this.autorunDisposer();
    }
  }

  searchRecipes(needle: string | null): void {
    if (needle === '') {
      this.resetSearch();
    } else {
      const { search } = this.props.actions.recipePreview;
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
    this.setState({ needle: null });
  }

  render(): ReactElement {
    const { recipePreviews, recipes, services } = this.props.stores;

    const { app: appActions, service: serviceActions } = this.props.actions;

    const { filter } = this.params;
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
      needle !== null
        ? this.prepareRecipes([
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
          ]).sort(this._sortByName)
        : recipeFilter;

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
          addedServiceCount={services.all.length}
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
            appActions.openExternalUrl({ url: FRANZ_DEV_DOCS })
          }
        />
      </ErrorBoundary>
    );
  }
}

export default inject('stores', 'actions')(observer(RecipesScreen));
