import Fastify from 'fastify'
const fastify = Fastify({
    logger: true,
})

import { fileURLToPath } from 'url';
import { dirname } from 'path';

//Plugins
import fastifyFormBody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';

fastify.register(fastifyFormBody);
fastify.register(fastifyCookie);
fastify.register(fastifyStatic, {
    root: dirname(fileURLToPath(import.meta.url))
});

//Routes
import commentSectionRoutes from './src/routes/comment_section_routes.mjs';

fastify.register(commentSectionRoutes);

// CONFIG
const PORT = 80;
const ADDRESS = '0.0.0.0' 

fastify.listen(PORT, ADDRESS, () => {
        console.log(`Server listening on port ${PORT}`);
});

