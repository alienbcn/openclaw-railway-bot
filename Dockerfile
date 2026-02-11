# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY .npmrc package*.json ./
RUN npm install --ignore-scripts

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

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
