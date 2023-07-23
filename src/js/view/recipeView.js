// import icons from '../../img/icons.svg'; // Works in Parcel 1
import icons from 'url:../../img/icons.svg'; // For static assets, that are not programming files, such as images, videos or sound files, we need to write url:
// console.log(`Showing the path to the icons located in the dist folder:`, icons);

import View from './View.js';


class RecipeView extends View
{
  _parentElement = document.querySelector('.recipe');
  _deleteRecipeWindow = document.querySelector(`.delete-recipe-window`);
  _errorMessage = `Well this is awkward...there is nothing here`;

  _deleteOverlay = document.querySelector(`.delete-overlay`);
  _closeDeleteWindow = document.querySelector(`.btn--close-delete-window`);
  _buttonYes = document.querySelector(`.button__yes`);
  _buttonNo = document.querySelector(`.button__no`);

  constructor()
  {
    super();
    this._addHandlerCloseConfirmWindow();
  }

  _generateMarkup()
  {
    return `
        <figure class="recipe__fig">
          <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
          <h1 class="recipe__title">
            <span>"${this._data.title}"</span>
          </h1>
        </figure>

        <div class="recipe__details">
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-clock"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
            <span class="recipe__info-text">minutes</span>
          </div>
          <div class="recipe__info">
            <svg class="recipe__info-icon">
              <use href="${icons}#icon-users"></use>
            </svg>
            <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
            <span class="recipe__info-text">servings</span>

            <div class="recipe__info-buttons">
              <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings - 1}">
                <svg>
                  <use href="${icons}#icon-minus-circle"></use>
                </svg>
              </button>
              <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings + 1}">
                <svg>
                  <use href="${icons}#icon-plus-circle"></use>
                </svg>
              </button>
            </div>
          </div>

          <div class="recipe__user-generated ${this._data.key ? `` : 'hidden'}">
            <svg>
              <use href="${icons}#icon-user"></use>
            </svg>
          </div>
          <button class="btn--round btn--bookmark">
            <svg class="">
              <use href="${icons}#icon-bookmark${this._data.bookmarked ? `-fill` : ``}"></use>
            </svg>
          </button>

          ${this._data.key ?
        `<button class="btn--round btn--delete">
              <svg class="">
                <use href="${icons}#icon-delete" style="transform: translateX(2.6px)translateY(1.9px)"></use>
              </svg>
            </button>`
        : ``}
        </div>

        <div class="recipe__ingredients">
          <h2 class="heading--2">Recipe ingredients</h2>
          <ul class="recipe__ingredient-list">
            ${this._data.ingredients
        .map(this._generateMarkupIngredient)
        .join(``)}
        </div>

        <div class="recipe__directions">
          <h2 class="heading--2">How to cook it</h2>
          <p class="recipe__directions-text">
            This recipe was carefully designed and tested by
            <span class="recipe__publisher">"${this._data.publisher}"</span>. Please check out
            directions at their website.
          </p>
          <a
            class="btn--small recipe__btn"
            href="${this._data.sourceUrl}"
            target="_blank"
          >
            <span>Directions</span>
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
          </a>
        </div>
      `;
  }

  _generateMarkupIngredient(ingredient)
  {
    return `
          <li class="recipe__ingredient">
            <svg class="recipe__icon">
              <use href="${icons}#icon-check"></use>
            </svg>
            <div class="recipe__quantity">${ingredient.quantity ?
        ingredient.quantity % 1 === 0 ? ingredient.quantity : ingredient.quantity.toFixed(3)
        : ``}</div>
            <div class="recipe__description">
              <span class="recipe__unit">${ingredient.unit}</span>
              ${ingredient.description}
            </div>
          </li>
          `;
  }

  toggleDeleteWindow()
  {
    this._deleteRecipeWindow.classList.toggle(`hidden`);
    this._deleteOverlay.classList.toggle(`hidden`);
  }

  addHandlerShowDeleteWindow(handler)
  {
    this._parentElement.addEventListener(`click`, function (event)
    {
      const btn = event.target.closest(`.btn--delete`);

      if (!btn) return;

      handler();
    });
  }

  // When there is a button that opens another window with more buttons, one structure is to make the class already assign event listeners and handlers to the buttons and initialize it on the class' creation. This works if the elements already exist in the DOM
  _addHandlerCloseConfirmWindow()
  {
    this._deleteOverlay.addEventListener(`click`, this.toggleDeleteWindow.bind(this));
    this._closeDeleteWindow.addEventListener(`click`, this.toggleDeleteWindow.bind(this));
    this._buttonNo.addEventListener(`click`, this.toggleDeleteWindow.bind(this));
  }


  addHandlerDeleteRecipe(handler)
  {
    this._buttonYes.addEventListener(`click`, handler);
  }

  // Since the buttons are in the recipe container, we can create the event handler here, no need for a new file/class
  addHandlerUpdateServings(handler)
  {
    // Delegation
    this._parentElement.addEventListener(`click`, function (event)
    {
      // Checking if the clicked element is one of the two buttons
      const btn = event.target.closest(`.btn--update-servings`);

      if (!btn) return;

      // Destructuring - we can't use it when converting to a number because first it will convert btn.dataset to a number and then try to get updateTo from that number
      // const { updateTo } = +btn.dataset;
      const updateTo = +btn.dataset.updateTo;

      if (updateTo > 0) handler(updateTo);
    });
  }

  addHandlerAddBookmark(handler)
  {
    // The button of this class btn--bookmark does not exist by the time the application is loaded. So by the time the page starts, this element doesn't exist, so it is impossible to add an event listener to an element that doesn't exist. This is a good use case for delegation
    this._parentElement.addEventListener(`click`, function (event)
    {
      const btn = event.target.closest(`.btn--bookmark`);

      if (!btn) return;

      handler();
    });
  }

  // Part of Publisher-Subscriber Pattern
  addHandlerRender(handler)
  {
    // When we want to run the same function for mupltiple events, we can create an array holding all the events we want to listen to

    // Adding a hash change event listener - but if we open the url in a new tab by copy-pasting it, then nothing will open, because the hash hasn't changed
    // window.addEventListener(`hashchange`, showRecipe);

    // Thats why we need to also listen to the load event - the event when the entire page is loading
    // window.addEventListener(`load`, showRecipe);

    // Now the problem is that if we open a new tab without a hash, then we get an error, because there is no id (showRecipe tries to get the id of the url), we make a guard clause for that in the controlRecipes()
    [`hashchange`, `load`].forEach(event => window.addEventListener(event, handler));
  }
}

// Exporting the newly created class instead of the class itself so we can make sure that we always have only one of this class (singleton)
export default new RecipeView();
