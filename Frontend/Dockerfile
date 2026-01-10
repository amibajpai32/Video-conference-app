# Use the specific node version you checked earlier
FROM node:22.12.0

# Set the working directory
WORKDIR /app

# Copy package files first (better for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your frontend code
COPY . .

# Vite's default dev port
EXPOSE 5173

# Run Vite with the --host flag so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]