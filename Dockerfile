# Stage 1: Build frontend and backend
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools for native modules (sqlite3)
RUN apk add --no-cache python3 make g++

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/

# Install root dependencies (for Vite build)
RUN npm install --no-audit --no-fund

# Copy the rest of the source
COPY . .

# Build frontend
RUN npm run build

# Build backend (TypeScript)
RUN cd backend && npm run build

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy backend dist and package.json
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json

# Install only production dependencies for backend
RUN cd backend && npm install --only=production --no-audit --no-fund

# Create data directory for SQLite
RUN mkdir -p /data

# Expose port
EXPOSE 5000

# Start the backend which serves the frontend
CMD ["node", "backend/dist/server.js"]
