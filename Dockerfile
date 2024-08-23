# Step 1: Use the Node.js base image
FROM node:18-alpine

# Step 2: Install Python, g++, and make for node-gyp to compile native modules
RUN apk add --no-cache python3 make g++

# Step 3: Set the working directory inside the container
WORKDIR /app

# Step 4: Copy package.json and package-lock.json into the container
COPY package*.json ./

# Step 5: Install dependencies (this will also install bcrypt)
RUN npm install

# Step 6: Rebuild bcrypt to ensure it's compiled correctly for the environment
RUN npm rebuild bcrypt --build-from-source

# Step 7: Copy the rest of the app into the container
COPY . .

# Step 8: Expose the port that the server will run on
EXPOSE 3001

# Step 9: Set environment variables (if needed) via Docker environment file
ENV NODE_ENV production

# Step 10: Start the app
CMD ["node", "server.js"]
