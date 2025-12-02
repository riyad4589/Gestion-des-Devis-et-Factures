# Étape 1 : Build Maven
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# 1) Copier seulement le pom pour profiter du cache Docker
COPY pom.xml .

# 2) Télécharger toutes les dépendances (cache réutilisé tant que pom.xml ne change pas)
RUN mvn -q -DskipTests dependency:go-offline

# 3) Copier le code source
COPY src ./src

# 4) Build du jar
RUN mvn -q -DskipTests package

# Étape 2 : Runtime
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
