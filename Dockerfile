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

# Descarga e instala el controlador ODBC de Microsoft para SQL Server.
# IMPORTANTE: La URL y la versión del paquete `msodbcsql17` pueden cambiar.
# Te recomiendo visitar la documentación oficial de Microsoft para obtener la última versión estable y la URL correcta:
# https://learn.microsoft.com/en-us/sql/connect/odbc/linux-mac/install-microsoft-odbc-driver-sql-server-alpine-linux?view=sql-server-ver16
# La versión y URL a continuación son ejemplos y deben ser verificadas.
ARG MSODBCSQL_VERSION="17.10.3.1-1" # Versión de ejemplo, verifica la más reciente en el sitio de Microsoft
ARG MSODBCSQL_URL="https://download.microsoft.com/download/e/4/d/e4d9241b-4179-4560-a292-23c21a1f074d/msodbcsql17_${MSODBCSQL_VERSION}_amd64.tar.gz"

# Descarga el archivo tar.gz, lo extrae y ejecuta el script de instalación.
# `--accept-eula` es crucial para aceptar los términos de la licencia.
# Luego, se limpian los archivos temporales para reducir el tamaño final de la imagen.
RUN curl -fSL "$MSODBCSQL_URL" -o msodbcsql.tar.gz \
    && tar -xzf msodbcsql.tar.gz \
    && cd msodbcsql-${MSODBCSQL_VERSION} \
    && /bin/sh install.sh install --accept-eula \
    && rm -rf /var/cache/apk/* \
    && rm /msodbcsql.tar.gz /msodbcsql-${MSODBCSQL_VERSION} -r # Limpia los archivos descargados y el directorio extraído

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