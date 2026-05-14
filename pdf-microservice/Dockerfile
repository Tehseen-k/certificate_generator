# Use the official Microsoft Playwright image
FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose the Express port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
