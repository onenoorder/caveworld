# pull official base image
FROM node:22-alpine3.19

# set working directory
WORKDIR ../

# add `/app/node_modules/.bin` to $PATH
ENV PATH ../node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
#COPY ./node_modules ./node_modules
RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent

# add app
#COPY . ./
COPY ./public ./public
COPY ./config-overrides.js ./config-overrides.js
#COPY ./tsconfig.jest.json ./tsconfig.jest.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.paths.json ./tsconfig.paths.json
#COPY ./.env ./.env
#RUN cp -f ./src/environments/environment_dev.ts ./src/environments/environment.ts
COPY ./src ./src

# start app
CMD ["npm", "start"]