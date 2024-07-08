import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

import { USER_REQ_PROPERTY } from '@shared/modules/auth/constants/user-req-property';

async function auth0Authenticate(fastify: FastifyInstance): Promise<void> {
  fastify.decorateRequest(USER_REQ_PROPERTY, null);
}

export default fastifyPlugin(auth0Authenticate);
