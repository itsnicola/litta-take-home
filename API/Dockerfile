FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS build

RUN npm ci

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

FROM base AS dev

ENV NODE_ENV=development

RUN npm ci

COPY src ./src
COPY tsconfig.json ./

EXPOSE 3000

CMD ["sh", "-c", "npm run build && (npm run build -- --watch & node --watch dist/app.js)"]

FROM base AS runtime

ENV NODE_ENV=production

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
