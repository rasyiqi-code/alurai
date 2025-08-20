#!/bin/bash

# Docker Build Script for ALU-RAI Forms
# This script builds and optionally runs the Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="alurai-forms"
CONTAINER_NAME="alurai-forms-app"
PORT="3000"

echo -e "${GREEN}🚀 Building ALU-RAI Forms Docker Image...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}📝 Please edit .env file with your actual configuration before running the container.${NC}"
    else
        echo -e "${RED}❌ .env.example file not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Build the Docker image
echo -e "${GREEN}🔨 Building Docker image: ${IMAGE_NAME}...${NC}"
docker build -t ${IMAGE_NAME} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

# Ask if user wants to run the container
read -p "Do you want to run the container now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}🚀 Starting container...${NC}"
    
    # Stop and remove existing container if it exists
    if [ $(docker ps -aq -f name=${CONTAINER_NAME}) ]; then
        echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
    fi
    
    # Run the new container
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p ${PORT}:3000 \
        --env-file .env \
        ${IMAGE_NAME}
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Container started successfully!${NC}"
        echo -e "${GREEN}🌐 Application is running at: http://localhost:${PORT}${NC}"
        echo -e "${GREEN}📊 To view logs: docker logs -f ${CONTAINER_NAME}${NC}"
        echo -e "${GREEN}🛑 To stop: docker stop ${CONTAINER_NAME}${NC}"
    else
        echo -e "${RED}❌ Failed to start container!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🎉 Build process completed!${NC}"