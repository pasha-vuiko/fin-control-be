###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18.14-alpine As development

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

COPY . .

RUN npm ci

RUN npm run prisma:generate

###################
# BUILD FOR PRODUCTION
###################

FROM node:18.14-alpine As build

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

COPY --from=development /usr/src/app/node_modules ./node_modules

COPY . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci

RUN npm run prisma:generate


###################
# PRODUCTION
###################

FROM node:18.14-alpine As production

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

RUN npm run prisma:generate

CMD [ "node", "dist/main.js" ]