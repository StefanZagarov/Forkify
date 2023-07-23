import View from './View.js';

class AddRecipeView extends View
{
    _parentElement = document.querySelector(`.upload`);
    _window = document.querySelector(`.add-recipe-window`);
    _overlay = document.querySelector(`.overlay`);
    _btnOpen = document.querySelector(`.nav__btn--add-recipe`);
    _btnClose = document.querySelector(`.btn--close-modal`);
    _btnUpload = document.querySelector(`.upload__btn`);

    _createdRecipeMessage = document.querySelector(`.created-recipe-message`);
    _btnCloseCreatedRecipe = document.querySelector(`.btn--close-created-recipe`);

    _errorMessage = document.querySelector(`.invalid-field-message`);

    constructor()
    {
        super();
        this._addHandlerShowWindow();
        this._addHandlerHideWindow();
        this._addHandlerCloseRecipeAddedWindow();
    }

    // This doesn't need to be in the controller, because it has nothing special to do with this. So we just need this to run as soon as the object is created. So we make a constructor. In order to create this object though, we still need to import it in controller
    _addHandlerShowWindow()
    {
        this._btnOpen.addEventListener(`click`, this.openWindow.bind(this));
    }

    _addHandlerHideWindow()
    {
        this._btnClose.addEventListener(`click`, this.closeWindow.bind(this));
        this._overlay.addEventListener(`click`, this.closeWindow.bind(this));
    }

    closeWindow()
    {
        this._btnUpload.disabled = true;
        // Hiding if there were any errors
        this._errorMessage.classList.add(`hidden`);
        // Used to use .toggle() but it's messing with delete confirmation window as it is also part of the overlay
        this._overlay.classList.add(`hidden`);
        this._window.classList.add(`hidden`);
        this._createdRecipeMessage.classList.add(`hidden`);
    }

    openWindow()
    {
        this._overlay.classList.remove(`hidden`);
        this._window.classList.remove(`hidden`);
        this._btnUpload.disabled = false;
    }

    openSuccessWindow()
    {
        this._overlay.classList.remove(`hidden`);
        this._createdRecipeMessage.classList.remove(`hidden`);
    }

    closeSuccessWindow()
    {
        this._overlay.classList.add(`hidden`);
        this._createdRecipeMessage.classList.add(`hidden`);
    }

    showErrorMessage(message)
    {
        this._errorMessage.textContent = message;
        this._errorMessage.classList.remove(`hidden`);
    }

    _addHandlerCloseRecipeAddedWindow()
    {
        this._btnCloseCreatedRecipe.addEventListener(`click`, this.closeSuccessWindow.bind(this));
    }

    addHandlerUpload(handler)
    {
        this._parentElement.addEventListener(`submit`, function (event)
        {
            event.preventDefault();

            // We could select all the form elements and read the value property of all of them, but there is an easier, modern way called "form data" - it's a modern browser API
            // In the FormData() we have to pass an element that is a form. In this case it's the this keyword - we are in a parent function so "this" points to the element calling the event listener.
            // This will return a weird object that we can't really use, but we can spread that object into an array
            // This will give us an array containing all the fields and their values
            const dataArray = [...new FormData(this)];

            // Our recipe data is an object, while this returns an array, so we can use a handy method to convert entries to an object
            // fromEntries() takes an array of entries and converts them to an object
            const data = Object.fromEntries(dataArray);

            handler(data);
        });
    }
}

export default new AddRecipeView();
