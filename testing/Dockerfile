# Alpine Linux with OpenJDK JRE
FROM openjdk:8-jre-alpine

# Set working directory
WORKDIR /usr/src/testing

# copy WAR into image
COPY spring-boot-app-0.0.1-SNAPSHOT.war /java_tests.war 

# run application with this command line 
CMD ["/usr/bin/java", "-jar", "-Dspring.profiles.active=default", "/java_tests.war"]
