#!/bin/sh
set -e

# Push schema to database (create tables if they don't exist)
prisma db push --skip-generate --accept-data-loss

exec "$@"
