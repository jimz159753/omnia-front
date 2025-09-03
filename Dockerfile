FROM node:20-alpine

WORKDIR /app

# Install dependencies including Prisma
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client with correct binary targets
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3000

# Use standalone server for production
CMD ["node", ".next/standalone/server.js"]
