# pull official base image
FROM node:15.5.0-alpine3.10 as build

# set working directory
WORKDIR ../

# add `/app/node_modules/.bin` to $PATH
ENV PATH ../node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@3.4.3 -g --silent

# add app
COPY . ./
#RUN cp -f ./src/environments/environment_prod.ts ./src/environments/environment.ts
RUN npm run build

# production environment
FROM nginx:1.15
COPY --from=build /build /usr/share/nginx/html
# new
COPY nginx-prod.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]