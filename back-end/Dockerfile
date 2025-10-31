# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /back-end

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install global dependencies
RUN npm install -g nodemon ts-node typescript

# Install dependencies
RUN npm install
RUN npm install --save-dev @types/node @types/express @types/cors @types/swagger-jsdoc @types/swagger-ui-express

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Define the command to run the app
CMD ["npm", "run", "dev"]