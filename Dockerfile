#FROM mhart/alpine-node:latest
FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install using npm
RUN npm install
RUN apt update
RUN apt install -y vim

# Run the node server on startup
CMD [ "node", "server.js" ]
