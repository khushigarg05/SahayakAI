# ==========================================
# SahayakAI Frontend - Next.js 15 Production Container
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install libc6-compat for alpine and curl for health check
RUN apk add --no-cache libc6-compat curl

# Copy dependency specifications
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm ci

# Copy application source code
COPY . .

# Set production environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=3000

# Build Next.js application with webpack
RUN npm run build

# Expose web server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start Next.js production server
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
