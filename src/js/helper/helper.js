// Contains functions that we will reuse over and over in our project
import { TIMEOUT_SEC } from "../config/config";

const timeout = function (s)
{
    return new Promise(function (_, reject)
    {
        setTimeout(function ()
        {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, s * 1000);
    });
};

export const AJAX = async function (url, uploadData = undefined)
{
    try
    {
        const fetchData = uploadData
            ? fetch(url, {
                method: `POST`,
                // headers is a snippet of text which are about the request itself
                headers: {
                    // With this we specify that the data we are going to send is in json format
                    'Content-Type': 'application/json'
                },
                // The data we want to send is body
                body: JSON.stringify(uploadData)
            })
            : fetch(url);

        // Creating a race between the timeout and the fetch so we don't get stuck in an infinite loading
        const response = await Promise.race([fetchData, timeout(TIMEOUT_SEC)]);
        // The APIs will return data back. This is important as this data contains information about the object, time of creation and, what we need in this case, a key. We will use the key to mark the uploaded object as our own recipes
        const data = await response.json();

        if (!response.ok) throw new Error(`${data.message} (${response.status})`);

        return data;
    }
    catch (error)
    {
        throw error;
    }
};

export const remove = async function (url)
{
    try
    {
        const result = fetch(url, {
            method: `DELETE`,
            headers: {
                'Content-Type': 'application/json'
            },
            // Apparantly this is not needed when deleting
            // body: JSON.stringify(recipe)
        });

        const response = await Promise.race([result, timeout(TIMEOUT_SEC)]);

        // Returns SyntaxError: Unexpected end of JSON input
        // const data = await response.json();

        if (!response.ok) throw new Error(`${response.status}`);

        // return data;
    }
    catch (error)
    {
        throw error;
    }
};
