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

# Copy static assets for standalone build
RUN cp -r .next/static .next/standalone/.next/static
RUN cp -r public .next/standalone/public

EXPOSE 3000

# Use standalone server for production
CMD ["node", ".next/standalone/server.js"]
