# Use Node 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the code
COPY . .

# Build TypeScript
RUN npm run build

# Expose Port
EXPOSE 3001

# Start Server
CMD ["npm", "start"]
