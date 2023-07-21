import { API_URL, RESULTS_PER_PAGE, BOOKMARKS_RESULTS_PER_PAGE, KEY } from '../config/config.js';
import { AJAX, remove } from '../helper/helper.js';

export const state = {
    recipe: {},
    search: {
        // We may not need query now, but one day we might need it, so it's better to already have the data stored
        query: ``,
        results: [],
        resultsPerPage: RESULTS_PER_PAGE,
        page: 1
    },

    bookmarks: {
        recipes: [],
        resultsPerPage: BOOKMARKS_RESULTS_PER_PAGE,
        page: 1
    }
};

const createRecipeObject = function (data)
{
    // const recipe = data.data.recipe; // Since our variable's name is the same as the object's name, we can instead use destructuring
    const { recipe } = data.data;

    // Checking recipe before edit
    // console.log(`Recipe - before edit:`, recipe);

    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        // Using a nice trick to add a key to the object if the data we give this function contains a key
        // Short circuiting - if the data we just sent doesnt have a key property, then this short circuits and nothing happens and the destructuring does nothing. If a key property exists then this object will be created with the key propery and the whole expression will become this object. Then we spread that object to put the values here, as if the value is like this:
        // key: recipe key
        ...(recipe.key && { key: recipe.key })
    };
};

// Exporting it so we can use it
// This is impure function as it manipulates the outside object state. It can be fixed, but it's a lot of work and not worth it in this case
export const loadRecipe = async function (id)
{
    try
    {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

        state.recipe = createRecipeObject(data);

        // some() can also be called "any" because it's searching if "any" of the object with the given condition exists
        if (state.bookmarks.recipes.some(bookmark => bookmark.id === id)) state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;

        // Checking recipe after edit
        // console.log(`Recipe after assigning it to a new object with fixed property names:`, state.recipe);
    }
    catch (error)
    {
        throw error;
    }
};


export const loadSearchResults = async function (query)
{
    try
    {
        state.search.query = query;

        // The way we add a parameter in a url is with the question mark
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

        // Creating new array storing all recipes with changed property name (fixing the underscore _ again);
        state.search.results = data.data.recipes.map(recipe =>
        {
            return {
                publisher: recipe.publisher,
                image: recipe.image_url,
                title: recipe.title,
                id: recipe.id,
                // Adding the key here aswell so it can diplay the user icon when we have our own recipe on the search results
                ...(recipe.key && { key: recipe.key })
            };
        });

        state.search.page = 1;
    }
    catch (error)
    {
        console.error(`${error} 💥💥💥💥`);
        throw error;
    }
};

export const getSearchResultPage = function (page = state.search.page)
{
    // It's important to know on which page we are
    state.search.page = page;

    // We start with the number of the page minus one (because the array is zero-based) multiplied by the ammount of results we want on the page
    // end is just the page multiplied by the ammount of content we want to display
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;

    return state.search.results.slice(start, end);
};

export const getBookmarksPage = function (page = state.bookmarks.page)
{
    state.bookmarks.page = page;

    const start = (page - 1) * state.bookmarks.resultsPerPage;
    const end = page * state.bookmarks.resultsPerPage;

    return state.bookmarks.recipes.slice(start, end);
};

export const updateServings = function (newServings)
{
    state.recipe.ingredients.forEach(ingredient =>
    {
        // newQuantity = oldQuantity * newServings / oldServings // 2 * 8 / 4 = 4
        ingredient.quantity = (ingredient.quantity * newServings) / state.recipe.servings;
    });

    state.recipe.servings = newServings;
};

export const addBookmark = function (recipe)
{
    // Add recipe as bookmark
    state.bookmarks.recipes.push(recipe);

    // Mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistStorage();
};

// This is a common pattern in programming - when we want to add something we get the entire data, and when we want to delete something, we get only the id
export const removeBookmark = function (id)
{
    const index = state.bookmarks.recipes.findIndex(element => element.id === id);

    if (!index) throw new Error(`No bookmark found`);

    // To delete something we use the splice() method
    state.bookmarks.recipes.splice(index, 1);

    // Mark current recipe as not bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistStorage();
};

const persistStorage = function ()
{
    localStorage.setItem(`bookmarks`, JSON.stringify(state.bookmarks.recipes));
};

// This function will make a request to the API so it'll be async
export const uploadRecipe = async function (newRecipe)
{
    try
    {
        // We need to convert that object to the standart object we use to get recipes from the API
        // First we create an array for the ingredients and filter to get only the properties
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith(`ingredient`) && entry[1] !== ``)
            .map(ingredient =>
            {
                const ingArr = ingredient[1]
                    .split(`,`)
                    .map(element => element.trim());

                // If the user inputs only quantity and no commas after that (or quantity and unit) then we get undefined. We want to always have some value in the three fields
                if (ingArr.length !== 3) throw new Error(`A field doesn't include a quantity, unit or description`);

                const [quantity, unit, description] = ingArr;

                return { quantity: quantity ? +quantity : null, unit, description };
            });

        // Now we need to create an object that the API will receive, and we need to basically flip what we did on line 31, since the API receives object with the property names of what we converted to our object
        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        // Creating the AJAX request
        // Question mark is to specify a list of parameters
        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
        persistStorage();
    }
    catch (error)
    {
        throw error;
    }
};

export const deleteRecipe = async function ()
{
    try
    {
        if (state.recipe.bookmarked)
        {
            removeBookmark(state.recipe.id);
        }

        await remove(`${API_URL}${state.recipe.id}?key=${KEY}`, state.recipe);
    }
    catch (error)
    {
        throw error;
    }
};

const init = function ()
{
    const storage = localStorage.getItem(`bookmarks`);

    if (storage) state.bookmarks.recipes = JSON.parse(storage);
};
init();
// console.log(state.bookmarks.recipes);

// A function for debugging, used only during development
const clearBookmarks = function ()
{
    localStorage.clear(`bookmarks`);
};
