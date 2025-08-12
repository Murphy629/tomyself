# Use Ubuntu as base image
FROM ubuntu:22.04

# Prevent prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies for adding new repos
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22 from NodeSource
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
WORKDIR /app

# Copy all files from the current directory into the container
COPY . .

# Install backend dependencies (if applicable)
# RUN pip3 install -r backend/requirements.txt

# Install frontend dependencies (if applicable)
# RUN cd frontend && npm install

# Expose ports
EXPOSE 5173 3000 8086

# Default command
CMD ["bash"]