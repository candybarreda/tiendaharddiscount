FROM node:lts-alpine3.20

# Set working directory for the Node.js application
WORKDIR /app

# Install necessary packages for ODBC Driver 17 and Node.js dependencies
# freetds for TDS protocol, unixodbc for ODBC driver manager, and msodbcsql17 for Microsoft ODBC driver
# libstdc++ for C++ standard library dependency of msodbcsql17
RUN apk add --no-cache \
    unixodbc \
    unixodbc-dev \
    freetds \
    libstdc++ \
    curl \
    gnupg \
    libc6-compat

# Download and install Microsoft ODBC Driver 17 for SQL Server for Alpine Linux
# This step downloads the .apk package and installs it.
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /etc/apk/keys/microsoft.rsa.pub && \
    echo "https://packages.microsoft.com/alpine/3.20/prod" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache msodbcsql17


COPY package*.json ./
RUN npm install
COPY . .

# Expose the port your Node.js application listens on
EXPOSE 3000

# Expone el puerto en el que se ejecutará la aplicación.
# Por defecto, si la variable de entorno PORT no está definida, usará el puerto 3000.
EXPOSE ${PORT:-3000}

# Define el comando para iniciar la aplicación.
# Docker pasará automáticamente las variables de entorno definidas al ejecutar el contenedor
# (ej. `docker run -e DB_USER=myuser ...`).
CMD ["npm", "start"]