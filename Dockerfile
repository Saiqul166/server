# Base image for Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy all source code
COPY . .

# Expose port (Cloud Run defaults to 8080, but dynamically maps process.env.PORT)
EXPOSE 8080

# Command to run the application
CMD ["npm", "start"]
