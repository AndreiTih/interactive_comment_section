import { utils } from '../utils.mjs';
import model from '../model/model.mjs';
import renderer from '../rendering/comments_rendering.mjs';
    
const controller =
    {
        async deleteComment(req,res)
        {
            try
            {
                const success_json = {success : await model.deleteComment(req.body.id)};
                res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(success_json));
            }
            catch(err)
            {
                console.error(err);
            }
        },
        async showAllComments(req,res)
        {
            try{
                const html_page = await controller.renderAllCommentsForUser(req.cookies.username);
                res.status(200).header('Content-Type', 'text/html').send(html_page);
            }
            catch(err)
            {
                console.error(err);
            }
        },
        async sendComment(req,res)
        {
            try
            {
                await model.insertComment(req.cookies.username,req.body.comment_content);
                const html_page = await controller.renderAllCommentsForUser(req.cookies.username);
                res.status(200).header('Content-Type', 'text/html').send(html_page);
            }
            catch(err)
            {
                console.error(err);
            }
        },
        async editComment(req,res)
        {
            try
            {
                await model.editComment(req.body.edited_comment_id , req.body.comment_content);
                const html_page = await controller.renderAllCommentsForUser(req.cookies.username);
                res.status(200).header('Content-Type', 'text/html').send(html_page);
            }
            catch(err)
            {
                console.error(err);
            }
        },
        async login(req,res)
        {
            try
            {
                // Normally you'd get a password, hash it and compare it to the hashed password in the database, but there's no need for a complete login system
                // I want to check if the username exists in the databse, if not, create a new user.
                let is_user_in_db = await model.isUserInDataBase(req.body.username);
                if(!is_user_in_db)
                    await model.insertUser(req.body.username);

                // A hack to emulate a login system, normally you'd send back a unique hash representing the user
                res.setCookie('username', req.body.username);
                let html_page = await controller.renderAllCommentsForUser(req.body.username);
                res.status(200).header('Content-Type', 'text/html').send(html_page);//TODO: if we get bugs here maybe it's because we haven't mentioned utf8
            }
            catch(err)
            {
                console.error(err);
            }
        },

        // Prototype version of reply, just to start off with something. For now just posting a comment with @username indicating the username its replied to.
        // TODO: Return to this and make a proper database representation of replies, so that they can be rendered properly on the site(Each reply
        // would have a small indentation relative to the parent comment it replies to)
        async reply(req,res)
        {
            try
            {
                await model.insertComment(req.cookies.username, req.body.comment_content, req.body.replied_to_comment_id);
                const rendered_html_page = await controller.renderAllCommentsForUser(req.cookies.username);
                res.status(200).header('Content-Type', 'text/html').send(rendered_html_page);//TODO: if we get bugs here maybe it's because we haven't mentioned utf8
            }
            catch(err)
            {
                console.error(err);
            }
        },
        async renderAllCommentsForUser(username)
        {
            try{
                let comment_array = await model.getAllComments(); 
                let html_comment_array = [];
                const promises = [];
                for(let i in comment_array)
                {
                    const reply_username = (comment_array[i].ReplyID == null) ? null : await model.getUsernameWithID(comment_array[i].ReplyID);
                    promises.push(renderer.renderComment(
                        comment_array[i].Content,
                        comment_array[i].Username,
                        utils.sqlTimestampToString(comment_array[i].Time),
                        comment_array[i].Username == username,
                        comment_array[i].ID,
                        reply_username ));
                }
                const results = await Promise.all(promises);
                results.forEach(result => {
                    html_comment_array.push(result);
                });
                let html_comment_container = await renderer.renderCommentsContainer(html_comment_array);
                let html_page = await renderer.renderCommentsPage(html_comment_container,username);
                return html_page;
            }
            catch(err)
            {
                console.error(err);
            }
        },
    }
export default controller;
