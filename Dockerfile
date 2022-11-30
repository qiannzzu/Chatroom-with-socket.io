FROM node:alpine as base

WORKDIR /app

COPY . .

RUN rm -rf node_modules && yarn install --frozen-lockfile && yarn cache clean

COPY . .

EXPOSE 3000

CMD ["node", "./app.js"]