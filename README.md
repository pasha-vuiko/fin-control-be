# FinControl BE

## Description

Back-end for FinControl App

Tech Stack:
* [NestJS (Fastify)](https://docs.nestjs.com) as a freamwork
* [Prisma](https://www.prisma.io) as an ORM
* [PostgreSQL](https://www.postgresql.org) as a primary DB
* [Valkey](https://valkey.io) as DB for caching
* [Pino](https://github.com/pinojs/pino) as a logger
* [Jest](https://jestjs.io/) for unit and integration tests

## Installation

### Pre-requirements
* Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Install [Node.js](https://nodejs.org/en/)

## Running the app in DEV mode

Run this commands to prepare the project:

```bash
# install npm dependencies
npm install
```

```bash
# generate Prisma Client
npm run migrations:run
```

```bash
# run Docker infrastructure
docker compose up
```

Run this if you use local DB instance from docker-compose:

```bash
npm run migrations:run
```

Then run (watch mode)

```bash
# watch mode
npm run start:dev
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
