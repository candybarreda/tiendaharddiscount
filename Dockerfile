# Etapa 1: Etapa de construcción (Builder)
# Utiliza la imagen oficial de Node.js con Alpine Linux, que es ligera y eficiente.
FROM node:lts-alpine AS builder

# Instala las dependencias necesarias para el controlador ODBC de SQL Server y las herramientas de construcción.
# - curl: Para descargar el controlador.
# - unixodbc-dev: Cabeceras y herramientas de desarrollo para ODBC.
# - openssl-dev: Dependencia para OpenSSL, requerida por el controlador.
# - build-base: Herramientas esenciales de construcción (como gcc, g++), necesarias si tu proyecto Node.js tiene dependencias nativas que necesitan ser compiladas.
# - libstdc++: Librería estándar de C++, también requerida por el controlador.
RUN apk add --no-cache \
    curl \
    unixodbc-dev \
    openssl-dev \
    build-base \
    libstdc++

# update data from apt-get repositories
RUN apt-get update && \
    apt-get -y install unzip && \
    apt-get -y install curl && \
    apt-get -y install gnupg && \
    apt-get -y install wget

# Descarga e instala el controlador ODBC de Microsoft para SQL Server.
# IMPORTANTE: La URL y la versión del paquete `msodbcsql17` pueden cambiar.
# Te recomiendo visitar la documentación oficial de Microsoft para obtener la última versión estable y la URL correcta:
# https://learn.microsoft.com/en-us/sql/connect/odbc/linux-mac/install-microsoft-odbc-driver-sql-server-alpine-linux?view=sql-server-ver16
# La versión y URL a continuación son ejemplos y deben ser verificadas.
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql18 && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools18 && \
    echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc && \
    apt-get install -y unixodbc-dev && \
    apt-get install -y libgssapi-krb5-2

ENV PATH="$PATH:/opt/mssql-tools18/bin"


# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copia los archivos `package.json` y `package-lock.json` primero.
# Esto permite que Docker cachee la capa de instalación de dependencias,
# lo que acelera las futuras construcciones si solo cambia el código fuente.
COPY package*.json ./

# Instala las dependencias de Node.js.
# `--production` asegura que solo se instalen las dependencias de producción.
RUN npm install --production

# Copia el resto del código de tu aplicación al directorio de trabajo.
COPY . .

# Etapa 2: Etapa de producción
# Utiliza una imagen Node.js Alpine limpia para la imagen final,
# lo que resulta en un tamaño de imagen más pequeño y seguro.
FROM node:lts-alpine

# Instala solo las dependencias de tiempo de ejecución necesarias para el controlador ODBC.
# - unixodbc: Librería de tiempo de ejecución para ODBC.
# - libcurl: Librería de tiempo de ejecución para curl.
# - libssl3, libcrypto3: Librerías de OpenSSL de tiempo de ejecución.
# - libstdc++: Librería estándar de C++ de tiempo de ejecución.
RUN apk add --no-cache \
    unixodbc \
    libcurl \
    libssl3 \
    libcrypto3 \
    libstdc++

# Establece el directorio de trabajo.
WORKDIR /app

# Copia la aplicación construida desde la etapa 'builder'.
COPY --from=builder /app ./

# Expone el puerto en el que se ejecutará la aplicación.
# Por defecto, si la variable de entorno PORT no está definida, usará el puerto 3000.
EXPOSE ${PORT:-3000}

# Define el comando para iniciar la aplicación.
# Docker pasará automáticamente las variables de entorno definidas al ejecutar el contenedor
# (ej. `docker run -e DB_USER=myuser ...`).
CMD ["npm", "start"]