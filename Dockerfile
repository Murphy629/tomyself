# Base: Ubuntu with devcontainers conveniences (non-root user "vscode")
FROM mcr.microsoft.com/devcontainers/base:ubuntu-24.04

# Avoid interactive prompts during install
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js 22 from NodeSource and common build tools
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates curl gnupg build-essential git \
    # Add NodeSource repo for Node 22
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
         | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
         > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    # Clean up
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Optional: install pnpm & yarn globally (keep npm as default)
RUN corepack enable \
    && npm i -g yarn@stable pnpm@latest

# Set up workspace location
WORKDIR /app

# Use the non-root user provided by the base image
USER root

# Print versions (handy for debugging the build logs)
RUN node -v && npm -v && yarn -v && pnpm -v