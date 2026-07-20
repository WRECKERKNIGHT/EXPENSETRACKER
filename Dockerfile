FROM node:20-alpine AS builder
WORKDIR /app

# Install build deps
RUN apk add --no-cache python3 make g++

# Copy package files and install deps for frontend and backend
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
RUN npm ci --ignore-scripts --no-audit --no-fund

# Build frontend
COPY . .
RUN npm run build

# Build backend (TypeScript)
RUN cd backend && npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Copy only production node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy built frontend and backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/dist ./backend/dist

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "backend/dist/server.js"]
### Multi-stage Dockerfile
# Stage 1: build frontend and backend
FROM node:20-alpine AS builder
WORKDIR /app

# Install tools needed for building
RUN apk add --no-cache python3 make g++

# Copy root package and backend package to optimize layer caching
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package-lock.json* ./backend/

# Install root dependencies (for Vite build)
RUN npm install --no-audit --no-fund

# Copy the rest of the source
COPY . .

# Build frontend and backend
RUN npm run build

# Stage 2: runtime image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built frontend and backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/dist ./backend/dist

# Copy backend package.json and install production deps
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --only=production --no-audit --no-fund

# Expose port used by backend
EXPOSE 5000

# Start the backend which serves the frontend
CMD ["node", "backend/dist/server.js"]
