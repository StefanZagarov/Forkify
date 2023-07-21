import { APP_URL } from '../config/config.js';

class HomeView
{
    _headerLogo = document.querySelector(`.header__logo`);

    constructor()
    {
        this._addHandlerHomePage();
    }

    _addHandlerHomePage()
    {
        this._headerLogo.addEventListener(`click`, function ()
        {
            window.location.href = APP_URL;
        });
    }
}

export default new HomeView();
