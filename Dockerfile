# Multi-arch Ubuntu base (works on Apple Silicon + Intel + Windows via Docker Desktop/WSL2)
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Use bash for RUN steps
SHELL ["/bin/bash", "-lc"]

# Base tools and build deps for native addons
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg xz-utils tar git build-essential python3-minimal bash-completion \
 && rm -rf /var/lib/apt/lists/*

# ----- Install Node.js 22 from NodeSource (robust, explicit repo setup) -----
# NodeSource now uses a "nodistro" repo that is multi-arch and works on Ubuntu/Debian
RUN mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends nodejs \
 # sanity checks so the build fails if Node didn’t install
 && which node && node -v && npm -v \
 && corepack enable \
 && rm -rf /var/lib/apt/lists/*

# Workdir and root user (as requested)
WORKDIR /workspaces
USER root