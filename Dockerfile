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
RUN npx next build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache openssl \
  && addgroup -S app \
  && adduser -S app -G app \
  && mkdir -p /tmp \
  && chown -R app:app /tmp

# Install prisma CLI globally for migrations
RUN npm install -g prisma@6.14.0

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh \
  && mkdir -p ./public/uploads \
  && chown -R app:app ./public/uploads \
  && chown -R app:app /app

USER app

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]

