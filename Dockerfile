# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

# Production stage
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Instalar dependencias de producción únicamente
COPY package*.json ./
RUN npm install --omit=dev

# Copiar archivos compilados
COPY --from=builder /app/dist ./dist

# Variables de entorno requeridas
ENV NODE_ENV=production

# Comando para ejecutar el worker
CMD ["node", "dist/worker.js"]
