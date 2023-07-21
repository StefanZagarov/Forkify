import icons from 'url:../../img/icons.svg';

// We are exporting the class itself, because we are not going to create any instance of it
export default class View
{
    _data;

    _clear()
    {
        this._parentElement.innerHTML = ``;
    }

    renderSpinner()
    {
        const markup = `
         <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
         </div>
        `;

        this._clear();
        this._parentElement.insertAdjacentHTML(`afterbegin`, markup);
    }

    // Creating a JSDoc documentation
    // On top is the description of the function
    // @param data - we specify what type of data we are expecting/working with. In this case data expects an Object, or an Object array. We use | as an OR
    // @param render - render is specified as a boolean, and since it's optional we put the parameter name in square brackets [] and write the default value
    // @returns - defines what this function returns. In this case the function returns nothing or a string, so it's undefined or string
    // @this - defines what the "this" keyword points to, in this case it's an object of View

    /**
     * Render the received object to the DOM
     * @param {Object | Object[]} data The data to be rendered (recipe)
     * @param {boolean} [render=true] If false, create a markup string instead of rendering to the DOM
     * @returns {undefined | string}
     * @this {Object} View instance
     * @author Stefan Zagarov
     */
    render(data, render = true)
    {
        if (!data || Array.isArray(data) && data.length === 0) return this.renderError();

        this._data = data;

        const markup = this._generateMarkup();

        // Check bookmarksView.js for explanation
        if (!render) return markup;

        // Remove the message for searching for a recipe, or remove previous markup
        this._clear();

        this._parentElement.insertAdjacentHTML(`afterbegin`, markup);
    }

    // Creating an update so whenever we change the servings count, the site wont redownload all the images and re-render all the elements that don't need to change
    update(data)
    {
        // if (!data || Array.isArray(data) && data.length === 0);
        this._data = data;

        // Creating a new markup, but we will not render it. Instead we will compare this new HTML to the current HTML and then only change text and attributes that have changed from the old version
        // Here we have the markup, but that is only a string. So we can't compare it in this state with the DOM elements that we currently have on the page. To fix this, we can convert the markup string to a DOM object that's living in the memory and then we can use it to compare it with the actual DOM that is on the page
        const newMarkup = this._generateMarkup();

        // A DOM that lives only in our memory (sounds dramatic, but not *that* memory)
        const newDOM = document.createRange().createContextualFragment(newMarkup);

        // Getting all the elements from the new DOM - this is the DOM that would have rendered when changing the servings
        // Converting the two element arrays to a real array
        const newElements = Array.from(newDOM.querySelectorAll(`*`));
        const currentElements = Array.from(this._parentElement.querySelectorAll(`*`));

        // The current DOM will have servings still set to 4
        // The new DOM will have the servings to either 3 or 5 depending on the clicked button

        // Looping through the new elements
        newElements.forEach((newElement, index) =>
        {
            const currentElement = currentElements[index];

            // console.log(currentElement, newElement.isEqualNode(currentElement));

            // Update changed TEXT
            // To compare the current elements with the new elements we will use a method that is available on all nodes - isEqualNode()
            if (!newElement.isEqualNode(currentElement) && newElement.firstChild?.nodeValue.trim() !== ``)
            {
                // console.log(`Node value:`, newElement.firstChild.nodeValue.trim());

                // The element on the actual DOM that we will change (mutate) if there is difference between it and the elements from the DOM in our memory
                // This will create a problem though, as when we change the text content, we will remove the other elements that are in the container
                currentElement.textContent = newElement.textContent;

                // What we want to do is determine if the element only contains text, as it is the only thing we want to replace
                // To do that we use property that is avaiable on all nodes - nodeValue
                // firstChild will return a node. That node is actually what contains the text. The text is in the first child node
            }

            // So we have updated the text of the elements, but we hanven't updated the attributes of the elements. So right now if we increase or decrease servings, we will get only 3 and 5 servings

            // Update changed ATTRIBUTES
            // With this if statement, the attributes property will return an object (data-update-to) of all the attributes that have changed
            if (!newElement.isEqualNode(currentElement))
            {
                // console.log(newElement.attributes);

                // We need to convert that attributes object to an array and loop over it and copy all the attributes from one element to the other
                // This will take the data-update-to object from the new element and copy the values to the current element
                // So this will replace the 5 on the plus with 6 whenever we click it, same with the minus
                Array.from(newElement.attributes).forEach(attribute => currentElement.setAttribute(attribute.name, attribute.value));

                // Checking what we are looping over
                // console.log(`Checking what we are looping over:`, Array.from(newElement.attributes));
            }

            // ! This algorithm may not be the most robust one, so it might not be the best algorithm to really use in the real-world, unless you have a small application like this one. For really big applications this algorithm may not be performant enough so it might not be good enough
        });
    }

    renderError(message = this._errorMessage)
    {
        const markup = `
         <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
        </div>
        `;

        this._clear();
        this._parentElement.insertAdjacentHTML(`afterbegin`, markup);
    }
}
