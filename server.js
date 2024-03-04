import http from 'node:http';
import fs from 'fs';
import path from 'path';

const hostname = '127.0.0.1';
const port = 3000;
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
