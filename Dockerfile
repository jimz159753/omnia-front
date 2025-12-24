FROM node:20-alpine AS base

WORKDIR /app

# Install OpenSSL for Prisma compatibility
RUN apk add --no-cache openssl

# Install dependencies including Prisma
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client with correct binary targets
RUN npx prisma generate

USER app

# Development stage
FROM base AS development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
# Build the application (skip Prisma migration during build)
RUN npx next build

# Copy static assets for standalone build
RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public

EXPOSE 3000

# Use standalone server for production
CMD ["node", ".next/standalone/server.js"]
