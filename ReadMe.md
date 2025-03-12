# **Patholens Project - Running with Docker Compose**

## **Prerequisites**
Before running the project, make sure you have the following installed on your system:

- [Docker](https://www.docker.com/get-started)

- [Docker Compose](https://docs.docker.com/compose/install/)

## **Getting Started**
To run the project using Docker Compose, follow these steps:

### **1. Clone the Repository**
If you haven't already, clone the project repository from **Bitbucket**:
```sh
git clone <REPOSITORY_URL>
```
Replace <REPOSITORY_URL> with the actual URL of the repository

### **2. Navigate to the Project Directory**
Move into the directory where the `docker-compose.yml` file is located:
```sh
cd patholens/patholensProject
```

### **3. Start the Application**
Run the following command to build and start the application:
```sh
docker compose up --build
```

### **4. Access the Application**
Once the application is running, you can access it in your browser:

* Main application:
```sh
http://localhost:8000/
```

* Django Admin Panel:
```sh
http://localhost:8000/admin/
```

### **5. Stopping the Application**
To stop the application, press `CTRL + C` in the terminal and then run:
```sh
docker compose down
```