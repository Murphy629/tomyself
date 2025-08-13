FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# Use bash for RUN steps
SHELL ["/bin/bash", "-lc"]

# Base tools, build deps for native addons, and SSH
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg xz-utils tar git build-essential python3-minimal bash-completion \
    openssh-client openssh-server zsh \
 && rm -rf /var/lib/apt/lists/*

# Create SSH host keys
RUN ssh-keygen -A

# ----- Install Node.js 22 from NodeSource (robust, explicit repo setup) -----
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

# ----- PM2 (choose ONE of the two lines below) -----
# If you prefer npm:
RUN npm install -g pm2
# If you prefer pnpm (Corepack provides it):  (uncomment next line and remove the npm line above)
# RUN corepack prepare pnpm@latest --activate && pnpm add -g pm2

# ----- zsh-autosuggestions (no oh-my-zsh required) -----
RUN git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions /usr/local/share/zsh-autosuggestions

# Set up minimal zsh config that loads autosuggestions and sane completions
# Also set zsh as the default login shell for root inside the container.
RUN echo 'export ZDOTDIR=${ZDOTDIR:-$HOME}' >> /etc/zsh/zshenv \
 && printf '%s\n' \
    '# History & completion' \
    'setopt HIST_IGNORE_ALL_DUPS HIST_IGNORE_SPACE SHARE_HISTORY EXTENDED_HISTORY' \
    'autoload -Uz compinit && compinit' \
    '' \
    '# Autosuggestions' \
    'source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh' \
    '' \
    '# Prompt (lightweight)' \
    'PROMPT="%F{cyan}%n@%m%f:%F{yellow}%~%f %# "' \
    > /etc/zsh/zshrc \
 && chsh -s /usr/bin/zsh root

# Install additional packages
RUN apt update && apt install -y zsh-autosuggestions
RUN apt update && apt install -y iputils-ping

# Workdir and root user
WORKDIR /workspaces
USER root

# Default shell for interactive docker exec (keeps /bin/bash for Dockerfile RUN via SHELL directive)
CMD [ "zsh" ]