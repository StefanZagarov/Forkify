import View from './View.js';

class SearchView extends View
{
    _parentElement = document.querySelector(`.search`);

    getQuery()
    {
        const query = this._parentElement.querySelector(`.search__field`).value;
        this._clearInput();
        return query;
    }

    addHandlerSearch(handler)
    {
        // We will listen for the submit event from the entire form, so this will work no matter if the user clicks the submit button or presses enter
        // We can't just sent the handler, because first we need to prevent the default behaviour of the event to reload the page
        this._parentElement.addEventListener(`submit`, function (event)
        {
            event.preventDefault();
            handler();
        });
    }

    _clearInput()
    {
        this._parentElement.querySelector(`.search__field`).value = ``;
    }
}

export default new SearchView();
