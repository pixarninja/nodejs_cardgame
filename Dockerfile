FROM mhart/alpine-node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install using npm
RUN npm install

# Bundle app source
COPY . .

# Expose ports 8000 to 9000, 8000 will be mapped to port 80 when run
EXPOSE 1337
EXPOSE 8000-9000

# Run the node server on startup
CMD [ "node", "server.js" ]
