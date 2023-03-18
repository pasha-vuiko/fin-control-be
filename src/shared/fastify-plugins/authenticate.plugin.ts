import { FastifyInstance } from 'fastify';
import auth0Verify from 'fastify-auth0-verify';
import fastifyPlugin from 'fastify-plugin';

async function authenticate(
  fastify: FastifyInstance,
  options: IAuth0PluginOpts,
): Promise<void> {
  await fastify.register(auth0Verify, options);

  fastify.decorateRequest('authenticate', fastify.authenticate);
}

export default fastifyPlugin(authenticate);

export interface IAuth0PluginOpts {
  domain: string;
  secret: string;
}
