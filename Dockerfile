FROM node:20.18.0-alpine

ARG VERSION

WORKDIR /opt/app/

COPY package.json package-lock.json nest-cli.json .env.example tsconfig.json tsconfig.build.json /opt/app/
COPY ./src /opt/app/src/
COPY ./prisma /opt/app/prisma/

RUN apk add --update \
    openssl --no-cache \
    dumb-init --no-cache \
    && apk cache clean \
    && npm ci --ignore-scripts \
    && npx prisma generate \
    && npm run build \
    && rm -rf tsconfig.json tsconfig.build.json src \
    && npm prune --production \
    && npx clean-modules -y \
    && npm uninstall -g clean-modules \
    && npm cache clean --force

ENV APP_PORT=3000 \
    APP_VERSION=${VERSION:-unknown} \
    NODE_ENV=production \
    NODE_OPTIONS="--enable-source-maps" \
    LOG_FORMAT="json"

EXPOSE $APP_PORT

USER node
CMD ["dumb-init", "node", "/opt/app/dist/src/main.js"]