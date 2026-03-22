#!/bin/sh
set -e

echo "🍷 Starting VinApp..."

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "⚠️  APP_KEY not set — generating..."
    php artisan key:generate --force
fi

# Wait for DB and run migrations
echo "🔄 Waiting for database and running migrations..."
RETRIES=20
until php artisan migrate --force; do
    RETRIES=$((RETRIES - 1))
    if [ $RETRIES -le 0 ]; then
        echo "❌ Database not available after retries. Exiting."
        exit 1
    fi
    echo "⏳ DB not ready yet, retrying in 5s... ($RETRIES retries left)"
    sleep 5
done

# Clear and cache config
echo "🔧 Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link
php artisan storage:link --force 2>/dev/null || true

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "✅ App ready — starting services..."

# Start supervisor (nginx + php-fpm + queue worker)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
