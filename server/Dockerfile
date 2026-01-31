FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY server/package.json server/package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy server code
COPY server/backup-server.js ./

# Create data directory
RUN mkdir -p /data/backups

# Expose port
EXPOSE 3081

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3081/api/health || exit 1

CMD ["node", "backup-server.js"]
