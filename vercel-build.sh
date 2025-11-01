#!/bin/bash
# Vercel build script

# Clean prisma client
rm -rf node_modules/.prisma 2>/dev/null || true

# Generate Prisma client WITHOUT data proxy
PRISMA_GENERATE_DATAPROXY=false npx prisma generate

# Build Next.js
next build
