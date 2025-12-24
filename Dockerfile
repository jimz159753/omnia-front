# ---------- deps ----------
  FROM node:20-alpine AS deps
  WORKDIR /app
  
  RUN apk add --no-cache openssl
  
  COPY package*.json ./
  RUN npm install
  
  COPY . .
  RUN npx prisma generate
  
  # ---------- build ----------
    FROM deps AS build
    ARG DATABASE_URL
    ENV DATABASE_URL=$DATABASE_URL
    RUN npx next build
  
  # ---------- runtime ----------
  FROM node:20-alpine AS runtime
  WORKDIR /app
  
  RUN apk add --no-cache openssl \
    && addgroup -S app \
    && adduser -S app -G app \
    && mkdir -p /tmp \
    && chown -R app:app /tmp
  
  COPY --from=build /app/.next/standalone ./
  COPY --from=build /app/.next/static ./.next/static
  COPY --from=build /app/public ./public
  
  USER app
  
  EXPOSE 3000
  CMD ["node", "server.js"]
  