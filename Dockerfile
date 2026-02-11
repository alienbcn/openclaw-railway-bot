# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY package*.json ./
RUN npm install

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends git openssh-client \
	&& rm -rf /var/lib/apt/lists/*

# Instalar dependencias de producción únicamente
COPY package*.json ./
RUN npm install --omit=dev

# Copiar archivos compilados
COPY --from=builder /app/dist ./dist

# Variables de entorno requeridas
ENV NODE_ENV=production

# Comando para ejecutar el worker
CMD ["node", "dist/worker.js"]
