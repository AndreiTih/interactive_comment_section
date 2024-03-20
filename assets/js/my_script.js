
function parseCookies(cookiesString) {
    const cookies = {};
    cookiesString.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        cookies[name] = decodeURIComponent(value);
    });
    return cookies;
}

// Callback function definitions
function createReplyHandler() {

    let reply_element = null;
    return function(event)
    {
        const cookies = parseCookies(document.cookie);
        if (cookies.username == undefined)
        {
            window.alert("You can't reply to a comment without being logged in.");
            return;
        }

        // Toggle between displaying the element and not if it's already been created 
        if (reply_element != null)
        {
            if(reply_element.style.display == "none")
                reply_element.style.display = "flex";
            else
                reply_element.style.display = "none";
        }
        else // Otherwise create the reply element and keep a reference to it
        {
            const comment_element = event.target.closest('.comment');
            const name_element = comment_element.querySelector('.name');

            // This is just a hack. At this point I'm interested in learning a more scalable frontend framework to avoid writing this type of code.
            const html_reply_component = `
            <form method="POST" action="/reply-comment" class="form-comment form-comment-reply">
                <input type="hidden" name="replied_to_comment_id" value="">
                <textarea name= "comment_content" type=text class="text-input" placeholder="Reply to ${name_element.innerText} ... "></textarea>
                <button type= "submit" class="send-button"> REPLY </button>
            </form>
            `;

            comment_element.insertAdjacentHTML('afterend', html_reply_component);
            reply_element = comment_element.nextElementSibling;
            
            // Overriding the default form behaviour is only necessary since we need to also send the id
            // of the comment that is being replied to
            reply_element.addEventListener('submit', function(event) {
                event.preventDefault();
                console.log('Form submitted! with reply_id value: ' + comment_element.dataset.id);
                const hidden_replied_to_comment_id_element = this.querySelector('[name="replied_to_comment_id"]');
                hidden_replied_to_comment_id_element.value = comment_element.dataset.id;
                reply_element.submit();
            });
        }
    }
}
// Almost identical to createReplyHandler(maybe refactor the code to account for the genericism)
function createEditHandler() {

    let edit_element = null;
    return function(event)
    {
        // Toggle between displaying the element and not if it's already been created 
        if (edit_element != null)
        {
            if(edit_element.style.display == "none")
                edit_element.style.display = "flex";
            else
                edit_element.style.display = "none";
        }
        else // Otherwise create the reply element and keep a reference to it
        {
            const comment_element = event.target.closest('.comment');

            // This is just a hack. At this point I'm interested in learning a more scalable frontend framework to avoid writing this type of code.
            const html_edit_component = `
            <form method="POST" action="/edit-comment" class="form-comment form-comment-reply">
                <input type="hidden" name="edited_comment_id" value="">
                <textarea name= "comment_content" type = text class="text-input" placeholder="Edit comment..."></textarea>
                <button type= "submit" class="send-button"> EDIT </button>
            </form>
            `;
            comment_element.insertAdjacentHTML('afterend', html_edit_component);
            edit_element = comment_element.nextElementSibling;
            
            // Overriding the default form behaviour is only necessary since we need to also send the id
            // of the comment that is being replied to
            edit_element.addEventListener('submit', function(event) {
                event.preventDefault();
                const hidden_edited_comment_id_element = this.querySelector('[name="edited_comment_id"]');
                hidden_edited_comment_id_element.value = comment_element.dataset.id;
                edit_element.submit();
            });
        }
    }
}

async function deleteCommentHandler(req,res)
{
    const comment_element = this.closest('.comment');
    try
    {
        const response = await fetch('/delete-comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id : comment_element.dataset.id })
        })
        const response_json = await response.json();
        if (response_json.success)
        {
            console.log("Succesfull in removing the comment from the database");
            comment_element.remove();
        }
        else
        {
            console.log("For some reason the comment didn't get deleted server-side");
        }
    }
    catch(error) 
    {
        console.log("There's been an error communicating with the server. Is the server running?");
    }
}

async function logoutHandler()
{
    // Sets the expiry date of the username cookie sometime in the past. Browser then deletes it
    document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    window.location.href = window.location.origin + "/";
}

// A few media breakpoints that change the DOM.
document.addEventListener('DOMContentLoaded', function() {
    const login_form = document.querySelector('.form-login');
    const main_content_div = document.getElementById('main-content');
    const aside_content_div = document.getElementById('aside-content');

    window.matchMedia('(max-width: 500px)').addListener((e)=>{
        if (e.matches)
            main_content_div.appendChild(login_form);
    });
    window.matchMedia('(min-width: 500px)').addListener((e)=>{
        if (e.matches)
            aside_content_div.appendChild(login_form);
    });

    // Attaching callbacks 
    // Other's comment
    // Reply button
    let elements;
    elements = document.getElementsByClassName('icon-text-reply');
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', createReplyHandler());
    }
    // Your comment
    // Edit button
    elements = document.getElementsByClassName('icon-text-edit');
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', createEditHandler());
    }
    // Delete button
    elements = document.getElementsByClassName('icon-text-delete');
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', deleteCommentHandler);
    }
    // Logout button
    const logout_element = document.querySelector('.logout-button');
    logout_element.addEventListener('click', logoutHandler);

    // Comment form
    const comment_form_element = document.querySelector('.form-comment');
    comment_form_element.addEventListener('submit', function(event) {
        event.preventDefault();
        //Don't allow unless the user is logged in
        const cookies = parseCookies(document.cookie);
        if(cookies.username == undefined)
        {
            //Here we add the logic that says you can't post a comment without being logged in.
            window.alert("You can't post a comment without being logged in.");
            return;
        }
        comment_form_element.submit();
    });

    
});



