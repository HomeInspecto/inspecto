# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /front-end

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Verify expo installation
RUN npx expo --version

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8081

# Define the command to run the app
CMD ["npx", "expo", "start", "--web"]
