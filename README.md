# FinControl BE

## Description

Back-end for FinControl App

Tech Stack:
* [NestJS (Fastify)](https://docs.nestjs.com) as a freamwork
* [Prisma](https://www.prisma.io) as an ORM
* [CockroachDB](https://www.cockroachlabs.com) as a primary DB
* [Redis](https://redis.com) as DB for caching
* [Pino](https://github.com/pinojs/pino) as a logger
* [Jest](https://jestjs.io/) for unit and integration tests

## Installation

### Pre-requirements
* Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Install [Node.js](https://nodejs.org/en/)

## Running the app in DEV mode

Firstly run this commands:

```bash
# install npm dependencies
npm install
```

```bash
# generate Prisma Client
npm run prisma:generate
```

```bash
# run Docker infrastructure
docker compose up
```

Then run 

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
