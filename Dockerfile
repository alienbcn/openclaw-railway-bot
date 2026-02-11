# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

# Force script execution to be disabled at package manager level
# and ensure dev deps are installed for the build.
ENV npm_config_ignore_scripts=true \
	npm_config_production=false \
	NODE_ENV=development

COPY .npmrc package*.json ./
RUN npm ci --ignore-scripts || true

COPY src ./src
COPY tsconfig.json ./

RUN npm run build
RUN npm prune --omit=dev --ignore-scripts

# Production stage
FROM node:22-slim

WORKDIR /app

# Copiar archivos compilados y node_modules del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Variables de entorno requeridas
ENV NODE_ENV=production

# Comando para ejecutar el worker
CMD ["node", "dist/worker.js"]
