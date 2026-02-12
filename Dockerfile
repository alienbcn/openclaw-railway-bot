# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

# Install dependencies with dev dependencies for building
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY src ./src
COPY tsconfig.json ./

RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Production stage
FROM node:22-slim

# Install Playwright dependencies
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Expose port for health checks
EXPOSE 3000

# Start command
CMD ["node", "dist/index.js"]
