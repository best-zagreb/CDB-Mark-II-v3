# Use the official Gradle image as the base image for dependency resolution
FROM gradle:8.2-jdk17 as builder

# Copy the project's build.gradle to the container
COPY build.gradle /app/build.gradle

# Set the working directory
WORKDIR /app

# Download dependencies using Gradle
RUN gradle clean bootJar --no-daemon

# Use a lightweight container with Java JDK 17 to run the application
FROM openjdk:17-slim

# Set the working directory
WORKDIR /app

# Copy the built JAR file from the builder stage
COPY --from=builder /app/build/libs/app-1.0.jar ./CDB-backend.jar

# Expose the application's port
EXPOSE 8080

# Set the entrypoint command to run the application
ENTRYPOINT ["java", "-jar", "CDB-backend.jar"]

