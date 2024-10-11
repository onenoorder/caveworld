# pull official base image
FROM node:22-alpine3.19 as build

# set working directory
WORKDIR ../

# add `/app/node_modules/.bin` to $PATH
ENV PATH ../node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent

# add app
COPY . ./
#RUN cp -f ./src/environments/environment_stage.ts ./src/environments/environment.ts
RUN npm run build

# production environment
FROM nginx:1.27.2
COPY --from=build /build /usr/share/nginx/html
# new
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]