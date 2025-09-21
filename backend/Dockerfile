FROM php:8.2-fpm
WORKDIR /var/www/html
RUN apt-get update \
    && apt-get install -y libpq-dev zip unzip git sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo pdo_pgsql pdo_sqlite
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"] 