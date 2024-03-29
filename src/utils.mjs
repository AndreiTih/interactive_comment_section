export const constants ={

    request_urls : {
        SEND_COMMENT: '/send-comment',
        LOGIN: '/login',
        REPLY: '/reply-comment',
        DELETE: '/delete-comment',
        EDIT: '/edit-comment',
    },
    comment_classes :
    {
        YOURS : 'comment-yours',
        OTHER : 'comment-other'
    },
    state_classes :
    {
        LOGGED_IN : 'is-logged-in',
        LOGGED_OUT : 'is-not-logged-in',
    },
    time_units_in_seconds : 
    {
        YEAR: 31536000,
        MONTH: 2592000,
        WEEK: 604800,
        DAY: 86400,
        HOUR: 3600,
        MINUTE: 60
    },
};

export const utils =
    {
        sqlTimestampToString(timestamp) {
            const now = new Date();
            const then = new Date(timestamp);
            const seconds = Math.floor((now - then) / 1000);

            let interval = Math.floor(seconds / constants.time_units_in_seconds.YEAR);

            if (interval > 1) {
                return `${interval} years ago`;
            }
            interval = Math.floor(seconds / constants.time_units_in_seconds.MONTH);
            if (interval > 1) {
                return `${interval} months ago`;
            }
            interval = Math.floor(seconds / constants.time_units_in_seconds.WEEK);
            if (interval > 1) {
                return `${interval} weeks ago`;
            }
            interval = Math.floor(seconds / constants.time_units_in_seconds.DAY);
            if (interval > 1) {
                return `${interval} days ago`;
            }
            interval = Math.floor(seconds / constants.time_units_in_seconds.HOUR);
            if (interval > 1) {
                return `${interval} hours ago`;
            }
            interval = Math.floor(seconds / constants.time_units_in_seconds.MINUTE);
            if (interval > 1) {
                return `${interval} minutes ago`;
            }
            return `${Math.floor(seconds)} seconds ago`;
        }
    }
