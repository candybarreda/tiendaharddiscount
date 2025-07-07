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
    unixODBC-dev \
    curl \
    gnupg \
    libstdc++ \
    krb5-libs \
    libgssapi_krb5 \
    libssl3 \
    openssl-dev

# Download and install Microsoft ODBC Driver 17 for SQL Server
# This involves adding Microsoft's repository and then installing the driver
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /etc/apk/keys/microsoft.asc.gpg \
    && echo "https://packages.microsoft.com/alpine/3.16/prod" >> /etc/apk/repositories \
    && apk add --no-cache msodbcsql17 \
    && apk add --no-cache mssql-tools

# Set environment variable for SQL Server tools path
ENV PATH="/opt/mssql-tools/bin:$PATH"


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