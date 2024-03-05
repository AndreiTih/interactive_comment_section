import http from 'node:http';
import fs from 'fs';
import path from 'path';

import model from './src/model.mjs';
import renderer from './src/html_template_rendering.mjs';

const hostname = '127.0.0.1';
const port = 3000;

/*Handles the browser requesting the '/' url.
    1. Obtains all comments from the database in some javascript form.
    2. Renders out the html for the page.
    3. Sends the response with the rendered out html.
*/
async function handleRootUrl(res)
{
    try{
        //TODO: Maybe make this return them in chronological order
        let comment_array = await model.getAllComments();
        // Iterate through all comments an create a list of
        //TODO: Change this bit to be comment-other or comment-yours based on whether you're logged in.
        //TODO: Add some enumerator somewhere for comment-other and comment-yours
        //TODO: Change 2 hours ago to a conversion from the timestamp to this type of string.
        let html_comment_array = [];
        for(let i in comment_array)
        {
            //TODO: Probably should use something like Promise.all here. A bit slow to await for each individual comment to get rendered.
            html_comment_array.push(await renderer.renderComment('comment-other', comment_array[i].Content , comment_array[i].Username, '2 hours ago'));
        }
        let html_comment_container = await renderer.renderCommentsContainer(html_comment_array);
        let html_page = await renderer.renderCommentsPage(html_comment_container);

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html_page);
    }
    catch(err)
    {
        console.error(err);
    }
}

const server = http.createServer((req, res) => {
    //console.log("A request: ");
    console.log(req.method);
    console.log(req.url);
    console.log("request accept contents:");
    console.log(req.headers.accept);



    //All GET requests:
    if(req.url === "/" ) 
    {
        console.log("in the / part");
        handleRootUrl(res);
        /*
        fs.readFile('index.html', (err, data) => {
            if (err) {
                // If there's an error reading the file, send a 500 internal server error response
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
            } else {
                // Send the HTML file as the response
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(data);
            }
        });
        */
    }
    else
    {

        fs.readFile(req.url.substring(1), (err, data) => {
            if (err) {
                console.log("error reading file");
                // If there's an error reading the file, send a 500 internal server error response
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Internal Server Error');
            } else {
                // Change Content-Type of the head of the response, based on what's requested

                if (req.headers.accept.includes('text/css'))
                {
                    console.log("Sending css!");
                    res.writeHead(200, {'Content-Type': 'text/css'});
                }// Left here: trying to get the image to send
                else if (req.headers.accept.includes('image/svg+xml'))
                {
                    // Left here: It seems to work if we send the image with this header, maybe
                    // refactor the thing so that we send them based on extension or something?
                    console.log("Sending svg!");
                    res.writeHead(200, {'Content-Type': 'image/svg+xml'});
                }
                else if (req.headers.accept.includes('image/*'))
                {
                    console.log("Sending image!");
                    res.writeHead(200, {'Content-Type': 'image/*'});
                }

                //TODO: Add a little something here in case we don't support what's requested.
                res.end(data);
            }
        });
    }
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
