# Use an official Node.js image as a base
FROM node:20

# Set the working directory inside the container
WORKDIR /src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Compile TypeScript code
# RUN npm run build

# Expose the port your app runs on
EXPOSE 3001

# Command to run the application
CMD [ "npm", "run", "prod"]
