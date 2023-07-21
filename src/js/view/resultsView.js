import View from './View.js';
import previewView from './previewView.js';

class ResultsView extends View
{
    _parentElement = document.querySelector(`.results`);
    _errorMessage = `No recipe found. You will have to improvise, try not to set everything on fire though.`;

    _generateMarkup()
    {
        // We should return a string for the markup so the View can insert that markup in the insertAdjacentHTML. However by having that render(), previewView will try to render some markup and that is not going to work
        // What we will do is add a second parameter to the render() method called render and by default set it to false, that way it will return only the markup without rendering it
        return this._data.map(result => previewView.render(result, false)).join(``);
    }
}

export default new ResultsView();
