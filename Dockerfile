# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install morgan

# Copy the rest of the code
COPY . .

# Expose the port
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]
