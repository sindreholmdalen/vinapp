#!/usr/bin/env bash

# VinApp - Laravel Forge Deploy Script
# This script runs automatically on every push to the main branch via Forge

set -e

echo "🍷 Deploying VinApp..."

# Pull latest code
cd /home/forge/vinapp.no

# Install/update PHP dependencies (production only)
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Install & build frontend assets
npm ci --prefer-offline
npm run build

# Run database migrations (without user input)
php artisan migrate --force

# Clear & re-cache config, routes, views
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Clear old application cache
php artisan cache:clear

# Link storage folder (safe to run multiple times)
php artisan storage:link

# Restart PHP-FPM queue workers
php artisan queue:restart

# Reload PHP-FPM
( flock -w 10 9 || exit 1
    echo 'Reloading PHP-FPM...'
    sudo -S service php8.2-fpm reload ) 9>/tmp/php-fpm.lock

echo "✅ Deployment complete!"
