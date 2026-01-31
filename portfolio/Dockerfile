FROM node:20-alpine AS build
WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY portfolio/package.json ./portfolio/

# Copy atoms (needed by copy-atoms.js which references ../../atoms)
COPY atoms/ ./atoms/

# Install dependencies (workspace-aware)
RUN npm ci --workspace=portfolio

# Copy portfolio source
COPY portfolio/ ./portfolio/

# Build (runs copy-atoms + generate-metadata + astro build)
WORKDIR /app/portfolio
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY portfolio/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built site
COPY --from=build /app/portfolio/dist /usr/share/nginx/html

# Expose port 80 (inside container)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1
