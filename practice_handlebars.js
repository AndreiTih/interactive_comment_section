import fs from 'fs';
import Handlebars from "handlebars";

// Renders a comment component
// comment_subclass: the css class of the comment. Can be either: comment-yours or comment-other.
// contents: The actual message of the comment
// username: Username of the user posting the comment
// date: When the comment was posted. Comes in a format such as: '2 weeks ago' , or '10 minutes ago' or '4 hours ago'
function renderComment( comment_subclass, contents, username, date)
{
    let handlebar_template = "";
    try
    {
        handlebar_template = fs.readFileSync('assets/handlebar_templates/comment.hbs', 'utf8');  
    }
    catch(err)
    {
        console.error('Error reading template file:', err);
        return;
    }
    return Handlebars.compile(handlebar_template)({comment_subclass: comment_subclass, contents: contents, username : username, date: date});
}

// Renders out the comments_container component from a list of comments
// comments: List of strings each representing a comment component
function renderCommentsContainer(comments)
{
    let handlebar_template = "";
    try
    {
        handlebar_template = fs.readFileSync('assets/handlebar_templates/comments_container.hbs', 'utf8');  
    }
    catch(err)
    {
        console.error('Error reading template file:', err);
        return;
    }

    return Handlebars.compile(handlebar_template)({comment: comments});
}

// Renders out the whole page containing the contents.
// comments_container: html string representing the comment component. 
function renderCommentsPage(comments_container)
{
    let handlebar_template = "";
    try
    {
        handlebar_template = fs.readFileSync('assets/handlebar_templates/comments_page.hbs', 'utf8');  
    }
    catch(err)
    {
        console.error('Error reading template file:', err);
        return;
    }

    return Handlebars.compile(handlebar_template)({comments_container: comments_container});
}

