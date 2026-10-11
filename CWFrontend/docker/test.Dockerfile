# Builds the production SPA and serves it through nginx for the Cypress E2E
# suite (docker-compose-test.yml). Same recipe as stage/prod, but with a clean
# WORKDIR and a reproducible npm ci from the committed lockfile.
FROM node:22-alpine3.19 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . ./
RUN npm run build

FROM nginx:1.27.2

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
