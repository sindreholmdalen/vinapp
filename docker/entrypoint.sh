#!/bin/sh
set -e

echo "🍷 Starting VinApp..."

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "⚠️  APP_KEY not set — generating..."
    php artisan key:generate --force
fi

# Run migrations
echo "🔄 Running migrations..."
php artisan migrate --force

# Clear stale caches first, then rebuild from current env vars
echo "🔧 Caching configuration..."
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache

# Create storage link
php artisan storage:link --force 2>/dev/null || true

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "✅ App ready — starting services..."

# Start supervisor (nginx + php-fpm + queue worker)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
