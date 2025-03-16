# Use the latest Python image as the base
FROM python:3.10

# Set the working directory inside the container
WORKDIR /app

# Copy the dependency file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project code into the container
COPY . .

# Set execution permissions for startup script
RUN chmod +x ./startup_app.sh

# Expose Django application port
EXPOSE 8000

# Start application
ENTRYPOINT ["sh", "./startup_app.sh"]
