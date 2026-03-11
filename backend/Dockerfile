# ---------- BUILD STAGE ----------
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom first to leverage Docker cache
COPY pom.xml .

# Download dependencies (faster rebuilds)
# RUN mvn -B -q -e -DskipTests dependency:go-offline

# Copy source
COPY src ./src

# Build application
RUN mvn clean package -DskipTests


# ---------- RUN STAGE ----------
FROM eclipse-temurin:17-jre

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r pontaje \
    && useradd -r -g pontaje pontaje \
    && mkdir -p /app/documents \
    && chown -R pontaje:pontaje /app

USER pontaje

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Run application
ENTRYPOINT ["java","-jar","app.jar"]
