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

# Use start command for production instead of dev
CMD ["npm", "run", "start"]
