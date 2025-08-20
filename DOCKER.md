# Docker Deployment Guide

This guide explains how to deploy ALU-RAI Forms using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier orchestration)
- Git (to clone the repository)

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repository-url>
cd alu-formai
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your actual configuration values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# ... other variables
```

### 3. Build and Run

#### Option A: Using PowerShell Script (Windows)

```powershell
# Build only
.\docker-build.ps1

# Build and run
.\docker-build.ps1 -Run

# Build and run on custom port
.\docker-build.ps1 -Run -Port 8080
```

#### Option B: Using Bash Script (Linux/Mac)

```bash
# Make script executable
chmod +x docker-build.sh

# Run the script
./docker-build.sh
```

#### Option C: Using Docker Compose

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop
docker-compose down
```

#### Option D: Manual Docker Commands

```bash
# Build the image
docker build -t alurai-forms .

# Run the container
docker run -d \
  --name alurai-forms-app \
  -p 3000:3000 \
  --env-file .env \
  alurai-forms
```

## Configuration

### Environment Variables

The application requires several environment variables. See `.env.example` for a complete list:

- **Firebase**: Authentication and database
- **MinIO**: File storage (optional)
- **RevenueCat**: Subscription management (optional)
- **Paddle**: Payment processing (optional)

### Port Configuration

By default, the application runs on port 3000. You can change this by modifying the port mapping:

```bash
# Run on port 8080
docker run -p 8080:3000 alurai-forms
```

## Production Deployment

### 1. Security Considerations

- Use strong, unique values for `NEXTAUTH_SECRET`
- Store sensitive environment variables securely
- Use HTTPS in production
- Configure proper firewall rules

### 2. Performance Optimization

- The Docker image uses multi-stage builds for smaller size
- Next.js is configured with `output: 'standalone'` for optimal Docker deployment
- Health checks are included for container monitoring

### 3. Monitoring

```bash
# View container logs
docker logs -f alurai-forms-app

# Check container status
docker ps

# Check container health
docker inspect alurai-forms-app | grep Health
```

### 4. Scaling

For production scaling, consider:

- Using Docker Swarm or Kubernetes
- Load balancing multiple container instances
- External database and file storage
- CDN for static assets

## Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t alurai-forms .
   ```

2. **Container Won't Start**
   ```bash
   # Check logs
   docker logs alurai-forms-app
   
   # Check environment variables
   docker exec alurai-forms-app env
   ```

3. **Port Already in Use**
   ```bash
   # Use different port
   docker run -p 3001:3000 alurai-forms
   ```

4. **Permission Issues**
   ```bash
   # On Linux/Mac, ensure proper permissions
   sudo chown -R $USER:$USER .
   ```

### Health Check

The container includes a health check endpoint. You can verify it's working:

```bash
curl http://localhost:3000/api/health
```

## File Structure

```
.
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore           # Files to exclude from build context
├── docker-build.sh         # Build script for Linux/Mac
├── docker-build.ps1        # Build script for Windows
├── .env.example            # Environment variables template
└── DOCKER.md              # This documentation
```

## Advanced Configuration

### Custom Dockerfile

If you need to modify the Docker configuration, edit the `Dockerfile`. The current setup:

- Uses Node.js 18 Alpine for smaller image size
- Multi-stage build for optimization
- Non-root user for security
- Health check for monitoring

### External Services

For production, consider using external services:

- **Database**: Firebase Firestore or PostgreSQL
- **File Storage**: MinIO, AWS S3, or Google Cloud Storage
- **Authentication**: Firebase Auth
- **Monitoring**: Prometheus, Grafana

## Support

If you encounter issues:

1. Check the logs: `docker logs alurai-forms-app`
2. Verify environment variables are set correctly
3. Ensure all required services (Firebase, etc.) are configured
4. Check Docker and system requirements

For more help, please refer to the main project documentation or create an issue in the repository.