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

WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Environment variables
ENV NODE_ENV=production

# Start command
CMD ["node", "dist/index.js"]
