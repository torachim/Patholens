# Medical Imaging Diagnostic Aid Platform

A full-stack web application that supports medical diagnoses through AI-powered image analysis. The platform enables doctors to view MRI images, visualize AI predictions, and enhance their diagnoses by incorporating external feedback (AI models) using annotations and interactive tools for marking multiple lesions. The application provides a user-friendly interface to assist doctors in the precise and efficient diagnosis of complex medical pathologies.


---

## Features

- **User Registration and Login**: Authentication and individual user accounts.

- **Medical Image Visualization**: Support for the NIFTI format using the `niivue` javascript-library.

- **Admin-pannel feature**: - all diagnosis are exportable and assigning specific datasets to each doctor is possible

- **AI Prediction Overlays**: Display AI model outputs on (edited) medical images.

- **Image Annotation**: Easy annotations using free-hand-drawing, rectangles, cuboids or optional AI-masks for marking multiple lesions.

- **Data Management**: Store annotations, user data and diagnostic information.

- **Time Tracking**: tracks time of every action for further analysis.

- **Randomized Experiment Workflow**: Minimize bias through randomized dataset presentation.

- **Session Continuation**: Progress is preserved upon logout.

---

## Technologies  

### Frontend  
- HTML  
- CSS  
- JavaScript (`niivue` for image rendering)  

### Backend  
- Python  
- Django  

### Database  
- MySQL lite

### Deployment
- Docker

---

## **Patholens Project - Running with Docker Compose**

### **Prerequisites**
Before running the project, make sure you have the following installed on your system:

- [Docker](https://www.docker.com/get-started)

- [Docker Compose](https://docs.docker.com/compose/install/)

### **Getting Started**
To run the project using Docker Compose, follow these steps:

### **1. Clone the Repository**
If you haven't already, clone the project repository from **Bitbucket**:
```sh
git clone <REPOSITORY_URL>
```
Replace <REPOSITORY_URL> with the actual URL of the repository

### **2. Navigate to the Project Directory**
Move into the project directory where the `docker-compose.yml` file is located:
```sh
cd patholens
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

---

### Authors  
- **Torge Rau** 
- **Lukas Baumeister**
- **Christoph Mauel**
- **Snehpreet Kaur Dhinsa**
- **Imene Benamer Belkacem Zadoud**
- **Imad Azizi**
- **Rafik Farhane**