# Interactive comment section

An implementation of a comment section design provided by [frontendmentor](https://frontendmentor.io).

## Technologies

1. Built with [node.js]([http://jekyllrb.com/](https://nodejs.org/en)).
1. Hosted on [Hostinger]([https://pages.github.com/](https://www.hostinger.co.uk/)). The project uses the KVM1 hosting solution, where the code is deployed using [pm2](https://pm2.keymetrics.io/). [MySql](https://dev.mysql.com/downloads/installer/) is used as the database technology.
1. The design used is the [interactive-comments-section](https://www.frontendmentor.io/challenges/interactive-comments-section-iG1RugEG9) challenge from [frontendmentor](https://frontendmentor.io).
1. I used [sass](https://sass-lang.com/) and
   [Google Fonts](https://www.google.com/fonts) for styling.
## Left to implement
- The upvotes functionality.
- The replies at the moment are normal comments with a span containing @[username] referencing the replied to comment. Ideally they would be placed under the comment that is being replied to and indented a bit.
- On my phone the website does not load correctly. svg icons don't get loaded and logging in causes the css to not get loaded. I could not replicate this on my friend's iphone or on https://appetize.io/.
- Handling niche situations such as: Deleting a comment that has replies pointing to it.
- Validate inputs server side. Currently they're only validated client-side. At the least guard against SQL injection.
- Refactoring the code to use a modern frontend framework such as React for client-side rendering instead of rendering server-side with [handlebars](https://handlebarsjs.com/).
- ~~Refactoring the backend-side to use a framework such as express or fastify instead of the http node module.~~
# Running the code

Run the command ```node server.js``` in the root of this repo to start the server.

## Database setup
Platform: Windows

I'm using MySQL Community Server - GPL, version 8.0.36.

server.js will assume this computer has a MySql server running for user = "root" with password = "qweasd123" on localhost:3306.

These details can be changed in db_config.json.

## Installing MySql

If you're on windows, download the installer from: https://dev.mysql.com/downloads/installer/ and follow the instructions provided.

