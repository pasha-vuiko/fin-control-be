import { FastifyInstance } from 'fastify';
import auth0Verify from 'fastify-auth0-verify';
import fastifyPlugin from 'fastify-plugin';

import { config } from '../../app.config';

async function authenticate(fastify: FastifyInstance): Promise<void> {
  await fastify.register(auth0Verify, {
    domain: config.auth.auth0Domain,
    secret: config.auth.auth0ClientSecret,
  });

  fastify.decorateRequest('authenticate', fastify.authenticate);
}

export default fastifyPlugin(authenticate);
