# Utiliza la imagen oficial de Node.js con Alpine Linux.
# Esta imagen es ligera y adecuada para pruebas.
FROM node:lts-alpine

# Establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Instala las dependencias necesarias para el controlador ODBC de SQL Server.
# - curl: Para descargar los paquetes.
# - gnupg: Para verificar las firmas de los paquetes (opcional pero recomendado si tienes los .sig).
# - unixodbc: La librería de tiempo de ejecución de ODBC.
# - libstdc++: Librería estándar de C++ requerida por el controlador.
# - ca-certificates: Necesario para que curl confíe en los certificados SSL.
RUN apk add --no-cache \
    curl \
    gnupg \
    unixodbc \
    libstdc++ \
    ca-certificates \
    # Dependencias adicionales que msodbcsql17 puede requerir
    libssl3 \
    libcrypto3

# --- Inicio de la instalación del controlador ODBC 17 para SQL Server ---
# Los siguientes comandos fueron proporcionados por Microsoft para Alpine Linux.
# Se ejecutan en una sola capa RUN para optimizar el tamaño y la velocidad de construcción.
RUN set -ex; \
    echo "Descargando paquetes del controlador ODBC y herramientas SQL..."; \
    # Descarga los paquetes .apk y sus firmas
    curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/msodbcsql17_17.10.6.1-1_amd64.apk; \
    curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/mssql-tools_17.10.1.1-1_amd64.apk; \
    curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/msodbcsql17_17.10.6.1-1_amd64.sig; \
    curl -O https://download.microsoft.com/download/e/4/e/e4e67866-dffd-428c-aac7-8d28ddafb39b/mssql-tools_17.10.1.1-1_amd64.sig; \
    \
    echo "Importando la clave GPG de Microsoft..."; \
    # Importa la clave GPG de Microsoft para verificar las firmas
    curl https://packages.microsoft.com/keys/microsoft.asc | gpg --import -; \
    \
    echo "Verificando firmas de los paquetes..."; \
    # Verifica las firmas de los paquetes descargados
    gpg --verify msodbcsql17_17.10.6.1-1_amd64.sig msodbcsql17_17.10.6.1-1_amd64.apk; \
    gpg --verify mssql-tools_17.10.1.1-1_amd64.sig mssql-tools_17.10.1.1-1_amd64.apk; \
    \
    echo "Instalando los paquetes del controlador ODBC y herramientas SQL..."; \
    # Instala los paquetes .apk. Se usa --allow-untrusted porque no estamos añadiendo el repositorio de Microsoft
    # de forma tradicional, sino instalando los .apk directamente.
    apk add --allow-untrusted msodbcsql17_17.10.6.1-1_amd64.apk; \
    apk add --allow-untrusted mssql-tools_17.10.1.1-1_amd64.apk; \
    \
    echo "Limpiando archivos descargados..."; \
    # Limpia los archivos .apk y .sig para reducir el tamaño de la imagen
    rm -f msodbcsql17_*.apk mssql-tools_*.apk msodbcsql17_*.sig mssql-tools_*.sig; \
    rm -rf /var/cache/apk/*; \
    echo "Instalación del controlador ODBC completada."
# --- Fin de la instalación del controlador ODBC 17 ---

# Copia los archivos `package.json` y `package-lock.json` primero.
# Esto permite que Docker cachee la capa de instalación de dependencias.
COPY package*.json ./

# Instala las dependencias de Node.js.
# `--production` asegura que solo se instalen las dependencias de producción.
RUN npm install --production

# Copia el resto del código de tu aplicación al directorio de trabajo.
COPY . .

# Expone el puerto en el que se ejecutará la aplicación.
# Por defecto, si la variable de entorno PORT no está definida, usará el puerto 3000.
EXPOSE ${PORT:-3000}

# Define el comando para iniciar la aplicación.
# Docker pasará automáticamente las variables de entorno definidas al ejecutar el contenedor.
CMD ["npm", "start"]