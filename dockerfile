########################################################################
# Multi-stage Dockerfile for Bun
# - Builder stage uses Bun image to install deps and build a standalone binary
# - Final stage is a minimal Debian image with required system libs.
########################################################################

FROM oven/bun:1.2.10-debian AS builder
LABEL stage=builder

# Create app directory
WORKDIR /app

# Copy package files first to leverage Docker layer cache for deps
# Copy the lockfile that exists in this repo (package-lock.json). If you
# use bun's bun.lockb in the future, prefer copying that instead.
COPY package.json package-lock.json  tsconfig.json ./

# Install all dependencies
RUN bun install --no-progress

# Copy the rest of the source
COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

ARG REDIS_URL
ENV REDIS_URL=$REDIS_URL

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

# Build a standalone executable (compiled) into .output/server
# --compile produces a native binary; --minify reduces size
RUN bun build src/index.ts --compile --minify --outfile .output/server

########################################################################
# Production image
########################################################################

FROM debian:bookworm-slim AS release
LABEL stage=release


# Install runtime dependencies required by the compiled binary.
# Adjust packages as needed for your environment.
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    tzdata \
    libssl3 \
    libgcc-s1 \
    libstdc++6 \
    procps \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user for safety
RUN useradd --system --create-home --home-dir /home/app app

WORKDIR /app

# Copy the compiled server from the builder
COPY --from=builder /app/.output/server ./server

# Make sure the binary is executable and owned by the non-root user
RUN chmod +x /app/server && chown -R app:app /app

USER app

# Expose the application's port (match your app's port if different)
EXPOSE 8080

# Minimal healthcheck (optional) â€” disabled by default, uncomment if you have /health
# HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:3000/health || exit 1

# Start the compiled server
CMD ["/app/server"]