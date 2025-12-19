# Use Node.js 20 as base (matching the .nvmrc)
FROM node:20-alpine AS base

# Install pnpm with retry logic
RUN apk add --no-cache curl && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install -g pnpm@9.5.0 || \
    (sleep 5 && npm install -g pnpm@9.5.0) || \
    (sleep 10 && npm install -g pnpm@9.5.0)

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy workspace packages
COPY chef-agent/package.json ./chef-agent/
COPY chefshot/package.json ./chefshot/
COPY test-kitchen/package.json ./test-kitchen/

# Install dependencies stage
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/chef-agent/node_modules ./chef-agent/node_modules
COPY --from=dependencies /app/chefshot/node_modules ./chefshot/node_modules
COPY --from=dependencies /app/test-kitchen/node_modules ./test-kitchen/node_modules

# Copy application source
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

# Install pnpm with retry logic (duplicated from base for multi-stage independence)
RUN apk add --no-cache curl && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install -g pnpm@9.5.0 || \
    (sleep 5 && npm install -g pnpm@9.5.0) || \
    (sleep 10 && npm install -g pnpm@9.5.0)

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# Copy workspace packages (needed for production dependencies)
COPY --from=builder /app/chef-agent ./chef-agent
COPY --from=builder /app/chefshot ./chefshot

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Expose the port the app runs on
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Start the application
CMD ["pnpm", "start"]
