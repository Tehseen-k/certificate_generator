# Use the official Microsoft Playwright image
FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose the Hugging Face default port
EXPOSE 7860

# Start the server
CMD ["node", "server.js"]
