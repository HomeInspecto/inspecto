# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /front-end

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .


# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["serve", "-s", "dist", "-l", "3000"]
