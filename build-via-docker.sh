#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the name for your Docker image
IMAGE_NAME="electron-builder-app"

# Define the project root directory (current directory)
PROJECT_ROOT="$(pwd)"

# Define the output directory on the host, relative to project root
# This should match what's in package.json build.directories.output
HOST_OUTPUT_DIR="${PROJECT_ROOT}/dist/electron"

# Create the host output directory if it doesn't exist, and ensure it's writable
mkdir -p "${HOST_OUTPUT_DIR}"
chmod 777 "${HOST_OUTPUT_DIR}" # Make it writable for the Docker user if it runs as root

echo "Building Docker image: ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" .

echo "Running build inside Docker container..."
# Mount the project root to /project in the container
# Mount the host's output directory to the container's output directory
# Run the build command as the current host user to avoid permission issues with output files
docker run --rm \
    --user "$(id -u):$(id -g)" \
    -v "${HOST_OUTPUT_DIR}:/usr/src/app/dist/electron" \
    "${IMAGE_NAME}" \
    npm run electron:build-portable

echo "Build complete. Portable executable should be in ${HOST_OUTPUT_DIR}"
