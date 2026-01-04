#!/usr/bin/env pwsh
# Quick Setup Script for Email and Redis
# Run this script to configure both services quickly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Meri Shikayat - Service Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Part 1: Email Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To configure email service:" -ForegroundColor Yellow
Write-Host "1. Enable 2FA on Gmail: https://myaccount.google.com/security" -ForegroundColor White
Write-Host "2. Generate App Password: https://myaccount.google.com/apppasswords" -ForegroundColor White
Write-Host "3. Select 'Mail' and 'Other (Custom name)'" -ForegroundColor White
Write-Host "4. Copy the 16-character password" -ForegroundColor White
Write-Host ""

$emailUser = Read-Host "Enter your Gmail address (or press Enter to skip)"

if ($emailUser) {
    $emailPassword = Read-Host "Enter your Gmail App Password (16 characters)" -AsSecureString
    $emailPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($emailPassword))
    
    # Update .env file
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace "EMAIL_USER=.*", "EMAIL_USER=$emailUser"
    $envContent = $envContent -replace "EMAIL_PASSWORD=.*", "EMAIL_PASSWORD=$emailPasswordPlain"
    $envContent | Set-Content ".env"
    
    Write-Host "✅ Email configuration added to .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  Email configuration skipped" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Part 2: Redis Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed: $dockerVersion" -ForegroundColor Green
    Write-Host ""
    
    $setupRedis = Read-Host "Do you want to setup Redis with Docker? (Y/n)"
    
    if ($setupRedis -ne 'n' -and $setupRedis -ne 'N') {
        Write-Host "Setting up Redis container..." -ForegroundColor Yellow
        
        # Check if container already exists
        $existingContainer = docker ps -a --filter "name=meri-shikayat-redis" --format "{{.Names}}"
        
        if ($existingContainer) {
            Write-Host "Redis container already exists. Starting it..." -ForegroundColor Yellow
            docker start meri-shikayat-redis
        } else {
            Write-Host "Creating new Redis container..." -ForegroundColor Yellow
            docker run -d --name meri-shikayat-redis -p 6379:6379 redis:7-alpine
        }
        
        # Wait for Redis to start
        Start-Sleep -Seconds 2
        
        # Test Redis connection
        $pingResult = docker exec meri-shikayat-redis redis-cli ping 2>$null
        
        if ($pingResult -eq "PONG") {
            Write-Host "✅ Redis is running and responding" -ForegroundColor Green
            
            # Update .env file
            $envContent = Get-Content ".env" -Raw
            $envContent = $envContent -replace "REDIS_HOST=.*", "REDIS_HOST=localhost"
            $envContent = $envContent -replace "REDIS_PORT=.*", "REDIS_PORT=6379"
            $envContent = $envContent -replace "REDIS_PASSWORD=.*", "REDIS_PASSWORD="
            $envContent | Set-Content ".env"
            
            Write-Host "✅ Redis configuration added to .env" -ForegroundColor Green
        } else {
            Write-Host "❌ Redis container started but not responding" -ForegroundColor Red
            Write-Host "Try: docker logs meri-shikayat-redis" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Redis setup skipped" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    Write-Host "Install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host "Or use Redis Cloud: https://redis.com/try-free/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review your .env file: notepad .env" -ForegroundColor White
Write-Host "2. Restart the server: npm start" -ForegroundColor White
Write-Host "3. Test configuration: npm run test:production" -ForegroundColor White
Write-Host ""

$openEnv = Read-Host "Do you want to open .env file now? (Y/n)"
if ($openEnv -ne 'n' -and $openEnv -ne 'N') {
    notepad .env
}
