# Step 1: Use the Node.js base image
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Step 4: Install dependencies (including bcryptjs)
RUN npm install

# Step 5: Copy the rest of the app into the container
COPY . .

# Step 6: Expose the port that the server will run on
EXPOSE 3001

# Step 7: Set environment variables (if needed) via Docker environment file
ENV NODE_ENV production

# Step 8: Start the app
CMD ["node", "server.js"]
