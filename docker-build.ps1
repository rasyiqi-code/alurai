# Docker Build Script for ALU-RAI Forms (PowerShell)
# This script builds and optionally runs the Docker container on Windows

param(
    [switch]$Run,
    [string]$ImageName = "alurai-forms",
    [string]$ContainerName = "alurai-forms-app",
    [int]$Port = 3000
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

Write-Host "🚀 Building ALU-RAI Forms Docker Image..." -ForegroundColor $Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor $Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "📝 Please edit .env file with your actual configuration before running the container." -ForegroundColor $Yellow
    } else {
        Write-Host "❌ .env.example file not found. Please create .env file manually." -ForegroundColor $Red
        exit 1
    }
}

# Build the Docker image
Write-Host "🔨 Building Docker image: $ImageName..." -ForegroundColor $Green
try {
    docker build -t $ImageName .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker image built successfully!" -ForegroundColor $Green
    } else {
        throw "Docker build failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "❌ Docker build failed: $_" -ForegroundColor $Red
    exit 1
}

# Ask if user wants to run the container (if -Run switch not provided)
if (-not $Run) {
    $response = Read-Host "Do you want to run the container now? (y/n)"
    if ($response -match "^[Yy]$") {
        $Run = $true
    }
}

if ($Run) {
    Write-Host "🚀 Starting container..." -ForegroundColor $Green
    
    # Stop and remove existing container if it exists
    $existingContainer = docker ps -aq -f "name=$ContainerName"
    if ($existingContainer) {
        Write-Host "🛑 Stopping existing container..." -ForegroundColor $Yellow
        docker stop $ContainerName
        docker rm $ContainerName
    }
    
    # Run the new container
    try {
        docker run -d `
            --name $ContainerName `
            -p "${Port}:3000" `
            --env-file .env `
            $ImageName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Container started successfully!" -ForegroundColor $Green
            Write-Host "🌐 Application is running at: http://localhost:$Port" -ForegroundColor $Cyan
            Write-Host "📊 To view logs: docker logs -f $ContainerName" -ForegroundColor $Cyan
            Write-Host "🛑 To stop: docker stop $ContainerName" -ForegroundColor $Cyan
        } else {
            throw "Failed to start container with exit code $LASTEXITCODE"
        }
    } catch {
        Write-Host "❌ Failed to start container: $_" -ForegroundColor $Red
        exit 1
    }
}

Write-Host "🎉 Build process completed!" -ForegroundColor $Green

# Usage examples
Write-Host "`nUsage examples:" -ForegroundColor $Yellow
Write-Host "  .\docker-build.ps1                    # Build only" -ForegroundColor $Cyan
Write-Host "  .\docker-build.ps1 -Run               # Build and run" -ForegroundColor $Cyan
Write-Host "  .\docker-build.ps1 -Run -Port 8080    # Build and run on port 8080" -ForegroundColor $Cyan