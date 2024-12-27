#!/bin/bash

# Build migrations for the current app
echo "Make Migrations"
python3 ./manage.py makemigrations accounts image 

# Run the migrations
echo "Apply Migrations"
python3 ./manage.py migrate

# Run Django Server
echo "Run Django Server"
python3 ./manage.py createsuperuser --noinput --username=admin
python3 ./manage.py runserver 0.0.0.0:8000
