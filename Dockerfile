FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the application
COPY . .

# Expose the port and start the app
EXPOSE 3000
CMD ["node", "index.js"]
