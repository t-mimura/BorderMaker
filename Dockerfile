# Use an official Node.js runtime as a parent image
FROM node:18-bullseye-slim

# Set environment variables to non-interactive (for apt-get)
ENV DEBIAN_FRONTEND=noninteractive

# Install Wine, p7zip, and other dependencies for electron-builder

# Enable i386 architecture
RUN dpkg --add-architecture i386 && \
    apt-get update

# Install prerequisites for WineHQ and other tools
RUN apt-get install -y --no-install-recommends \
    software-properties-common \
    wget \
    ca-certificates \
    gnupg \
    xz-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Download and install WineHQ repository key
RUN wget -O /tmp/winehq.key https://dl.winehq.org/wine-builds/winehq.key && \
    apt-key add /tmp/winehq.key && \
    rm /tmp/winehq.key

# Add WineHQ repository for Debian Bullseye
RUN echo "deb https://dl.winehq.org/wine-builds/debian/ bullseye main" > /etc/apt/sources.list.d/winehq.list

# Update package lists again after adding new repo and install WineHQ
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    winehq-stable \
    p7zip-full \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Verify Wine installation
RUN wine --version

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
