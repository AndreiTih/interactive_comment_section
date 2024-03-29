import {promises as fs} from 'fs';
import Handlebars from "handlebars";

/*
 Renders a comment component:

 contents: The actual message of the comment
 username: Username of the user posting the comment
 date: When the comment was posted. Comes in a format such as: '2 weeks ago' , or '10 minutes ago' or '4 hours ago'
 yours: Whether the comment belongs to the username or not
*/
const exports = {
    async renderComment(contents, username, date, yours = false, id, reply_username = null)
    {
        let handlebar_template = "";
        try
        {
            if(yours)
                handlebar_template = await fs.readFile('assets/handlebar_templates/comment_yours.hbs', 'utf8');  
            else
                handlebar_template = await fs.readFile('assets/handlebar_templates/comment_other.hbs', 'utf8');  

        }
        catch(err)
        {
            console.error('Error reading template file:', err);
            return;
        }
        return Handlebars.compile(handlebar_template)({contents: contents, username : username,
            date: date, id: id, reply_username : reply_username});
    },

    // Renders out the comments_container component from a list of comments
    // comments: List of strings each representing a comment component
    async renderCommentsContainer(comments)
    {
        let handlebar_template = "";
        try
        {
            handlebar_template = await fs.readFile('assets/handlebar_templates/comments_container.hbs', 'utf8');  
        }
        catch(err)
        {
            console.error('Error reading template file:', err);
            return;
        }

        return Handlebars.compile(handlebar_template)({comment: comments});
    },

    // Renders out the whole page containing the contents.
    // comments_container: html string representing the comment component. 
    // username: Name of user. Can pass undefined in which case the template will consider you as not logged in.
    async renderCommentsPage(comments_container,username)
    {
        let handlebar_template;
        try
        {
            handlebar_template = await fs.readFile('assets/handlebar_templates/comments_page.hbs', 'utf8');  
        }
        catch(err)
        {
            console.error('Error reading template file:', err);
            return;
        }

        return Handlebars.compile(handlebar_template)({comments_container: comments_container, username:username});
    },
}


export default exports;

