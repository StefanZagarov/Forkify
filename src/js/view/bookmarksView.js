import View from './View.js';
import previewView from './previewView.js';

class BookmarksView extends View
{
    _parentElement = document.querySelector(`.bookmarks__list`);
    _errorMessage = `No bookmarks yet, find something tasty and save it!`;

    addHandlerRender(handler)
    {
        window.addEventListener(`load`, handler);
    }

    _generateMarkup()
    {
        // We should return a string for the markup so the View can insert that markup in the insertAdjacentHTML. However by having that render(), previewView will try to render some markup and that is not going to work
        // What we will do is add a second parameter to the render() method called render and by default set it to false, that way it will return only the markup without rendering it
        return this._data.map(bookmark => previewView.render(bookmark, false)).join(``);
    }
}

export default new BookmarksView();
