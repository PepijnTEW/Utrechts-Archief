FROM php:8.5.10-apache

RUN docker-php-ext-install mysqli pdo_mysql
RUN a2enmod rewrite

RUN sed -ri \
    's!/var/www/html!/var/www/html/public!g' \
    /etc/apache2/sites-available/000-default.conf

RUN sed -ri \
    '/DocumentRoot \/var\/www\/html\/public/a\ \t<Directory \/var\/www\/html\/public>\n\t\tAllowOverride All\n\t\tRequire all granted\n\t</Directory>' \
    /etc/apache2/sites-available/000-default.conf