// Here we put all the variables that are constants and are reused across the project. This will allow us to easily configure our project by simply changing the data here in the cofiguration file
// We only want variables responsible for defining some important data about the application itself. Pretty much any magic number that is used to control something in the program also goes here

// Development key: fd1856dc-3446-4d49-b0f5-3859486e5067
// Public key: 8d3298b5-ed69-442a-8042-035b96ca7c9a

// It is common practice to use capital letters only for constant data, especially in a config file
export const APP_URL = `https://sz-forkify.netlify.app`;
export const API_URL = `https://forkify-api.herokuapp.com/api/v2/recipes/`;
export const TIMEOUT_SEC = 10;
export const RESULTS_PER_PAGE = 10;
export const BOOKMARKS_RESULTS_PER_PAGE = 7;
export const KEY = `8d3298b5-ed69-442a-8042-035b96ca7c9a`;
export const MODAL_CLOSE_SEC = 1.5;
