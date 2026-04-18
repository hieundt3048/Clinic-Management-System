# Clinic-Management-System
## How to run
### 1. CD to app folder
` cd path/to/Backend/app `
### 2. Run with jar file
` java -jar target/app-0.0.1-SNAPSHOT.jar `

## How to run (Docker)
### 1. Build Docker's image.
Go to the Docker file directory:
` cd path/to/Backend/app `
Build the image:
` docker build -t your-docker-image-name . `
### 2. Run the Docker's image
` docker run -p 8080:8080 -t your-docker-image-name `