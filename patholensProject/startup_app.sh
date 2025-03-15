#!/bin/bash

# Build migrations
echo "Make Migrations"
python3 manage.py makemigrations accounts image

# Apply migrations
echo "Apply Migrations"
python3 manage.py migrate

# create Superuser if it doesn't exist
echo "Checking for Superuser..."
python3 manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print("Superuser created")
else:
    print("Superuser already exists")
EOF

# Start Django-Server
echo "Starting Django Server..."
exec python3 manage.py runserver 0.0.0.0:8000
