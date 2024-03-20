import http from 'node:http';
import fs from 'fs';
import path from 'path';
import { constants, utils } from './src/utils.mjs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const querystring = require('querystring');

import model from './src/model.mjs';
import renderer from './src/html_template_rendering.mjs';

const hostname = '0.0.0.0';
const port = 80;


// Returns a string representing the rendered html of all comments in the Comments table for a user.
/*
Parameters: 
username: String representing the username of a user.
If the username is undefined all comment will have the comment-other class (won't be able to edit/delete them)
reply_username : Optional string that represents the username of the user this comment is replying to.
*/
async function renderAllCommentsForUser(username)
{
    try{
        let comment_array = await model.getAllComments(); 
        let html_comment_array = [];
        for(let i in comment_array)
        {
            //TODO: Should use something like Promise.all here. It's unnecessary to await for each individual comment to get rendered.
            const reply_username = (comment_array[i].ReplyID == null) ? null : await model.getUsernameWithID(comment_array[i].ReplyID);

            html_comment_array.push(await renderer.renderComment(
                comment_array[i].Content,
                comment_array[i].Username,
                utils.sqlTimestampToString(comment_array[i].Time),
                comment_array[i].Username == username,
                comment_array[i].ID,
                reply_username ));
        }
        let html_comment_container = await renderer.renderCommentsContainer(html_comment_array);
        let html_page = await renderer.renderCommentsPage(html_comment_container,username);
        return html_page;
    }
    catch(err)
    {
        console.error(err);
    }
}

async function handleDeleteComment(req,res)
{
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); 
    });
    req.on('end', async function() {
        console.log("this is the body" + body);
        const parsed_data = JSON.parse(body);
        
        const success_json = {success : await model.deleteComment(parsed_data.id)};

        // Want to return a json with a success value set to true or false.
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(success_json));
    });
}

async function handleRootUrl(req,res)
{
    try{
        const cookies = utils.parseCookies(req.headers.cookie);

        const html_page = await renderAllCommentsForUser(cookies.username);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html_page);
    }
    catch(err)
    {
        console.error(err);
    }
}
async function handleSendComment(req,res)
{
    const cookies = utils.parseCookies(req.headers.cookie);
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); 
    });
    req.on('end', async function(){
        const parsed_data = querystring.parse(body);
        await model.insertComment(cookies.username,parsed_data.comment_content);
        const rendered_html_page = await renderAllCommentsForUser(cookies.username);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(rendered_html_page, 'utf-8');
    });
}
async function handleEditComment(req,res)
{
    const cookies = utils.parseCookies(req.headers.cookie);
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); 
    });
    req.on('end', async function(){
        const parsed_data = querystring.parse(body);

        await model.editComment(parsed_data.edited_comment_id , parsed_data.comment_content);

        const rendered_html_page = await renderAllCommentsForUser(cookies.username);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(rendered_html_page, 'utf-8');
    });
}

async function handleLogin(req,res)
{
    let body = ''; // LEARNING NOTE: I'm surprised this works. I would've assumed the closure of the first anonymous function would have a different copy to the body variable
    req.on('data', chunk => {
        body += chunk.toString(); 
    });

    req.on('end', async function() {
        let parsed_data = utils.parseHTTPAttributeValueToObject(body);
        // Normally you'd get a password, hash it and compare it to the hashed password in the database, but there's no need for a complete login system
        // I want to check if the username exists in the databse, if not, create a new user.
        let is_user_in_db = await model.isUserInDataBase(parsed_data.username);
        if(!is_user_in_db)
        {
            // Create a new user
            await model.insertUser(parsed_data.username);
        }
        // Set cookie with user name. A hack to emulate a login system, normally you'd send back a unique hash representing the user
        res.setHeader('Set-Cookie', `username=${parsed_data.username}`);
        res.writeHead(200, { 'Content-Type': 'text/html' });

        let rendered_html_page = await renderAllCommentsForUser(parsed_data.username);
        res.end(rendered_html_page, 'utf-8');
    });
}

// Prototype version of reply, just to start off with something. For now just posting a comment with @username indicating the username its replied to.
// TODO: Return to this and make a proper database representation of replies, so that they can be rendered properly on the site(Each reply
//would have a small indentation relative to the comment it replies to)
async function handleReply(req,res)
{
    const cookies = utils.parseCookies(req.headers.cookie);
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); 
    });
    req.on('end', async function() {
        const parsed_data = querystring.parse(body);

        await model.insertComment(cookies.username, parsed_data.comment_content, parsed_data.replied_to_comment_id);

        const rendered_html_page = await renderAllCommentsForUser(cookies.username);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(rendered_html_page, 'utf-8');
    });
}
const server = http.createServer((req, res) => {
    ////////////// Handle all dynamic requests //////////////////

    if (req.method === 'GET' && req.url === '/') 
    {
        handleRootUrl(req,res);
    }
    else if(req.method == 'POST')
    {
        if(req.url == constants.request_urls.SEND_COMMENT)
        {
            handleSendComment(req,res);
        }
        else if(req.url == constants.request_urls.LOGIN)
        {
            handleLogin(req,res);
        }
        else if(req.url == constants.request_urls.REPLY)
        {
            handleReply(req,res);
        }
        else if(req.url == constants.request_urls.DELETE)
        {
            handleDeleteComment(req,res);
        }
        else if(req.url == constants.request_urls.EDIT)
        {
            handleEditComment(req,res);
        }
    }
    ////////////// Handle all requests for resources ////////////
    else if(req.method == 'GET')
    {
        let file_path = '.' + req.url;
        const file_extension = String(path.extname(file_path)).toLowerCase();
        const extension_to_mime_map = { // mime = Multipurpose Internet Mail Extension
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
        }
        const mime_type = extension_to_mime_map[file_extension] || 'application/octet-stream'; 

        fs.readFile(file_path, (err, content) => {
            if (err) {
                if (err.code === 'ENONET') {
                    console.error('ENONET')
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('404 Not Found');
                } else {
                    console.error('Internal server error' + err)
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('500 Internal Server Error');
                }
            } else {
                res.writeHead(200, { 'Content-Type': mime_type });
                res.end(content, 'utf-8');
            }
        });
    }
});


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
