import { constants } from '../utils.mjs';
import comments_controller from '../controllers/comment_section_controller.mjs';

function commentSectionRoutes(fastify,options,done) {
    fastify.get('/', comments_controller.showAllComments);
    fastify.post(constants.request_urls.SEND_COMMENT, comments_controller.sendComment);
    fastify.post(constants.request_urls.LOGIN, comments_controller.login);
    fastify.post(constants.request_urls.REPLY, comments_controller.reply);
    fastify.post(constants.request_urls.DELETE, comments_controller.deleteComment);
    fastify.post(constants.request_urls.EDIT, comments_controller.editComment);

    done();
}

export default commentSectionRoutes;
