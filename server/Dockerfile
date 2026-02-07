# -- Base stage
FROM public.ecr.aws/docker/library/node:lts-alpine as base

#create app directory
WORKDIR /app

# -- Build Dependency Stage
FROM base AS dependencies

# Install app dependencies
COPY server/package*.json ./

RUN npm install

# -- Build Stage
FROM dependencies AS build

WORKDIR /app

COPY server/. ./

RUN npm run build

# -- Release stage
FROM public.ecr.aws/docker/library/node:lts-alpine as release

WORKDIR /app

COPY --from=dependencies /app/package.json ./

RUN npm install

COPY --from=build /app/dist ./dist

RUN mkdir ./logs

EXPOSE 3000

CMD ["node", "dist/server.js"]
