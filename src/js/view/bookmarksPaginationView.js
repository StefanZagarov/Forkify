import View from './View.js';
import icons from 'url:../../img/icons.svg';

class BookmarksPaginationView extends View
{
  _parentElement = document.querySelector(`.bookmarks-pagination-parent`);
  _curPage;

  _generateMarkup()
  {
    this._curPage = this._data.page;
    const numPages = Math.ceil(this._data.recipes.length / this._data.resultsPerPage);

    // Page 1 with other pages
    if (this._curPage === 1 && numPages > 1) return this._nextButton();

    // Last page
    if (this._curPage === numPages && numPages > 1) return this._previousButton();

    // Other page
    if (this._curPage !== 1) return this._nextButton() + this._previousButton();

    // Page 1 with no other pages
    return ``;
  }

  _nextButton()
  {
    const nextPage = this._curPage + 1;

    return `
            <button data-goto="${nextPage}" class="btn--bookmarks-inline bookmarks-pagination__btn--next">
            <span>Page ${nextPage}</span>
              <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
              </svg>
            </button>
        `;
  }

  _previousButton()
  {
    const prevPage = this._curPage - 1;

    return `
            <button data-goto="${prevPage}" class="btn--bookmarks-inline bookmarks-pagination__btn--prev">
              <svg class="search__icon">
                 <use href="${icons}#icon-arrow-left"></use>
              </svg>
                <span>Page ${prevPage}</span>
            </button>
        `;
  }


  addHandlerBookmarksPageClick(handler)
  {
    // We create event delegation, because we don't want to listen to both buttons separately
    this._parentElement.addEventListener(`click`, function (event)
    {
      // Here we get the button that was clicked
      const btn = event.target.closest(`.btn--bookmarks-inline`);

      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }
}

export default new BookmarksPaginationView();
