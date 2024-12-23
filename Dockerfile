# Step 1: Use the Node.js base image
FROM node:23-slim 

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json into the container
COPY package*.json  ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the app into the container
COPY .  .

# Step 6: Expose the port that the server will run on
EXPOSE 3001

# Step 7: Build argument for environment variables
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ARG MONGO_URI
ENV MONGO_URI=${MONGO_URI}

ARG REDIS_HOST
ENV REDIS_HOST=${REDIS_HOST}

ARG REDIS_PORT
ENV REDIS_PORT=${REDIS_PORT}

# Step 8: Start the app
CMD ["npm", "run","dev"]
