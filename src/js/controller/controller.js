import * as model from '../model/model.js'; // Importing everything - the loadRecipe function and state object
import recipeView from '../view/recipeView.js';
import searchView from '../view/searchView.js';
import resultsView from '../view/resultsView.js';
import paginationView from '../view/paginationView.js';
import bookmarksPaginationView from '../view/bookmarksPaginationView.js';
import bookmarksView from '../view/bookmarksView.js';
import addRecipeView from '../view/addRecipeView.js';
import { MODAL_CLOSE_SEC } from '../config/config.js';
import homeView from '../view/homeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2 - Developed by the lecturer - Jonas Schmedtmann

// Hot Module Reloading
// if (module.hot) module.hot.accept();

// We call these functions controllers, but they are essentially handlers, because they handle events

// Show a recipe
const controlRecipes = async function ()
{
  try
  {
    // Taking the ID - window.location is the entire ID
    const id = window.location.hash.slice(1);
    // Don't give error if there is no id in the url, useful for when opening the site without entering id
    if (!id) return;

    console.log(model.state.bookmarks.recipes);

    // 0. Update results view to mark selected search result - it's the same as using the render on step 3 in controlSearchResults, but instead we are updating. We use update so there wont be flickering when we click on a recipe from the list, so all the elements and pictures won't have to redownload
    resultsView.update(model.getSearchResultPage());

    // 1.Loading recipe
    // Loading circle
    recipeView.renderSpinner();

    // This function doesn't return anything. Instead, we have access to the state object, that will be filled after this function
    await model.loadRecipe(id);

    // 2.Rendering recipe
    recipeView.render(model.state.recipe);

    // 3. Updating bookmarks view
    // Update the highlighted recipe if it's the one currently open on the right panel
    // There was a problem created here when updating the bookmarks view because the bookmarks weren't there yet, so we created a load handler for the bookmarks controlBookmarks() and event listener in bookmarksView
    // Creates error with controlBookmarksPagination()
    // bookmarksView.update(model.state.bookmarks.recipes);

    controlBookmarksPagination(model.state.bookmarks.page);
  }
  catch (error)
  {
    recipeView.renderError();
    console.error(error);
  }
};

// Show search results
const controlSearchResults = async function ()
{
  try
  {
    // 1. Get search query
    const query = searchView.getQuery();

    if (!query) return;

    // 2. Load search results
    resultsView.renderSpinner();

    // 3. Render search results
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultPage());

    // 4. Render initial pagination buttons
    paginationView.render(model.state.search);
  }
  catch (error)
  {
    console.error(error);
    resultsView.renderError(error);
  }
};

const controlPagination = function (goToPage)
{
  resultsView.render(model.getSearchResultPage(goToPage));

  paginationView.render(model.state.search);
};

const controlBookmarksPagination = function (goToPage)
{
  bookmarksView.render(model.getBookmarksPage(goToPage));

  bookmarksPaginationView.render(model.state.bookmarks);
};

const controlServings = function (newServings)
{
  // Update the recipe servings (in state object)
  // We don't want to manipulate data here in the controller, so we delegate that task to the model
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);

  // We don't want to re-render everything, we want to just update the servings
  // Update will still need all the data, but update() will only update text and attributes in the DOM without having to re-render the entire view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function ()
{
  // 1. Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.removeBookmark(model.state.recipe.id);

  // console.log(model.state.recipe);

  // 2. Update recipe view
  // Updating the bookmark icon and not re-rendering the entire page/view
  recipeView.update(model.state.recipe);

  // 3. Render the bookmarks
  controlBookmarksPagination(model.state.bookmarks.page);
};

// There was a problem created because the bookmarks weren't there yet, so we created a load handler for the bookmarks and event listener in bookmarksView - addHandlerRender() and we pass this function
const controlBookmarks = function ()
{
  controlBookmarksPagination(1);
};

const controlUpload = async function (newRecipe)
{
  try
  {
    // Close window
    addRecipeView.closeWindow();

    // Upload the user's recipe
    await model.uploadRecipe(newRecipe);
    // console.log(model.state.recipe);

    // Render the user's recipe
    recipeView.render(model.state.recipe);

    // Render Success message
    addRecipeView.openSuccessWindow();

    // Render (update) bookmarks
    controlBookmarksPagination(1);

    // Change ID in URL
    window.history.pushState(null, ``, `#${model.state.recipe.id}`);

    // Refresh search results
    await model.loadSearchResults(model.state.recipe.title);
    resultsView.render(model.getSearchResultPage());

    // Go back to page 1 to avoid bug where it displays page 1 but the pagination buttons shows page 2
    controlPagination(1);

    // Close the form window
    setTimeout(function ()
    {
      addRecipeView.closeSuccessWindow();
    }, MODAL_CLOSE_SEC * 1000);
  }
  catch (error)
  {
    addRecipeView.showErrorMessage(error);
    console.error(error);
  }
};

// This and the function below are part of the confirmation window for deleting recipe. This one opens the confirmation window, the one below handles the model logic of deleting the recipe if the Yes button is clicked. I can't think of a better way to structure it right now, but this is probably not the best way to do it
const controlShowDeleteWindow = function ()
{
  recipeView.toggleDeleteWindow();
};

const controlDeleteRecipe = async function ()
{
  try
  {
    // Remove recipe from API
    await model.deleteRecipe();

    // Close confirmation window
    recipeView.toggleDeleteWindow();

    // Update bookmarks
    controlBookmarksPagination(1);

    // Update the search results list
    await model.loadSearchResults(model.state.recipe.title);
    resultsView.render(model.getSearchResultPage());

    // Go back to page 1 to avoid bug where recipes are shown from page 1 but the pagination buttons show page 2
    controlPagination(model.state.recipe.page);
  } catch (error)
  {
    console.error(error);

    // const content = error.stack;
    // // Create element with <a> tag
    // const link = document.createElement("a");

    // // Create a blog object with the file content which you want to add to the file
    // const file = new Blob([content], { type: 'text/plain' });

    // // Add file content in the object URL
    // link.href = URL.createObjectURL(file);

    // // Add file name
    // link.download = "DeleteError.txt";

    // // Add click event to <a> tag to save file.
    // link.click();
    // URL.revokeObjectURL(link.href);
  }
};

// Implementing Publisher-Subscriber Pattern
const init = function ()
{
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerShowDeleteWindow(controlShowDeleteWindow);
  recipeView.addHandlerDeleteRecipe(controlDeleteRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerPageClick(controlPagination);
  bookmarksPaginationView.addHandlerBookmarksPageClick(controlBookmarksPagination);
  addRecipeView.addHandlerUpload(controlUpload);
};
init();
