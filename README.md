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

Download CockroachDB certificates:
```bash
# MacOS:
curl --create-dirs -o $HOME/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/84467408-2eeb-4e43-9305-d29a05cf78ec/cert
```
```bash
# Windows:
mkdir -p $env:appdata\postgresql\; Invoke-WebRequest -Uri https://cockroachlabs.cloud/clusters/84467408-2eeb-4e43-9305-d29a05cf78ec/cert -OutFile $env:appdata\postgresql\root.crt
```
```bash
# Linux:
curl --create-dirs -o $HOME/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/84467408-2eeb-4e43-9305-d29a05cf78ec/cert
```

Run this commands:

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
