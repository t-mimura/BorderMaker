# Use an official Node.js runtime as a parent image
FROM node:18-bullseye-slim

# Set environment variables to non-interactive (for apt-get)
ENV DEBIAN_FRONTEND=noninteractive

# Install wine, mono, and other potential dependencies for electron-builder
# Based on electron-builder documentation and common setups for Windows builds on Linux
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    winehq-stable \
    # mono-devel \ # Mono can be quite large, let's try without it first. Add if builds fail for specific targets.
    # g++ \ # Usually not needed unless native modules require compilation for the host (Linux)
    # build-essential \ # Same as above
    # icnsutils \ # For macOS icons, not strictly needed for Windows
    # graphicsmagick \ # For icon manipulation, but we're creating the icon beforehand
    # xz-utils \ # For certain compression formats
    # bsdmainutils \ # For certain utilities
    # p7zip-full \ # For 7zip archives
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Use npm ci for cleaner installs if package-lock.json is present
# RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm cache clean --force
# A simpler approach, assuming package-lock.json will be there:
RUN npm ci --ignore-scripts && npm cache clean --force

# Bundle app source
COPY . .

# Define a default command, though the build script will likely override this
# CMD [ "npm", "run", "electron:build-portable" ]
