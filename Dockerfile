FROM node:20.17.0-alpine

RUN apk add --update \
    openssl --no-cache \
    dumb-init --no-cache && apk cache clean

ARG VERSION

RUN mkdir -p /opt/app/
COPY package.json package-lock.json nest-cli.json .env.example tsconfig.json tsconfig.build.json /opt/app/
WORKDIR /opt/app/

COPY ./src /opt/app/src/
COPY ./prisma /opt/app/prisma/

RUN npm ci --ignore-scripts \
    && npm run prisma:generate \
    && npm run build \
    && rm -rf tsconfig.json tsconfig.build.json src \
    && npm prune --production \
    && npm cache clean --force

ENV APP_PORT=3000 \
    APP_VERSION=${VERSION:-unknown} \
    NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps" \
    LOG_FORMAT="json"

EXPOSE 3000

USER node
CMD ["dumb-init", "node", "/opt/app/dist/src/main.js"]