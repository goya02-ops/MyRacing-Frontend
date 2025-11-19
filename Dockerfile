# Dockerfile para Desarrollo (Frontend: Vite + React)
FROM node:24-alpine

# Definimos el entorno de desarrollo y la versión de pnpm (usando las ARG del init)
ARG PNPM_VERSION=10
ENV NODE_ENV development 

# Instalamos pnpm globalmente
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

# Copiamos solo los archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# Instalamos todas las dependencias (Development + Production)
RUN pnpm install --frozen-lockfile

# El CMD simplemente inicia el servidor de desarrollo de Vite
# Nota: La recarga en caliente y el código se manejarán con Volúmenes, NO con COPY.
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]