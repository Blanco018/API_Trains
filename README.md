Proyecto Gestión de Trenes
📌 Descripción

Este proyecto es una API y aplicación web para gestionar información de trenes y metros.
Se incluye autenticación de usuarios, rutas protegidas y persistencia de datos en MySQL.

⚙️ Requisitos

Node.js ≥ 14

MySQL ≥ 8

npm o yarn

1️⃣ Configuración del entorno

Crea un archivo .env en la raíz del proyecto con tus credenciales de MySQL:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=api_tren
DB_PORT=3306


Instala las dependencias:

npm install

2️⃣ Inicializar la base de datos

Inicia MySQL Workbench o tu consola MySQL.

Crea la base de datos si aún no existe:

CREATE DATABASE api_tren;


Ejecuta la ruta en la app para crear la tabla de trenes:

GET /create-trains-table


Esto creará la tabla trains con las columnas:

id, serie, apodo, tipo, servicio, operador, logo, descripcionVisual, zona, created_at

3️⃣ Población de datos de ejemplo

Para insertar los trenes iniciales, ejecuta la ruta:

GET /seed-trains


Esto solo se debe hacer una vez para evitar duplicados.

Inserta todos los trenes que antes estaban en memoria.

4️⃣ Autenticación de usuarios

Rutas disponibles:

GET /login → Muestra página de login/registro.

POST /register → Crea un usuario nuevo (contraseña encriptada con bcrypt).

POST /login → Inicia sesión del usuario.

GET /logout → Cierra la sesión del usuario.

💡 Las rutas /trenes y la página principal / están protegidas, solo accesibles si el usuario está logueado.

5️⃣ API de trenes

Ruta protegida:

GET /trenes


Retorna todos los trenes almacenados en la base de datos en formato JSON.

6️⃣ Verificación de la conexión a MySQL

Ruta de prueba:

GET /test-db


Devuelve un objeto JSON con { ok: true, result: 2 } si la conexión funciona correctamente.

7️⃣ Flujo completo para levantar el proyecto

Configura .env con tus credenciales.

Instala dependencias con npm install.

Crea la base de datos en MySQL (CREATE DATABASE api_tren;).

Ejecuta la ruta /create-trains-table para crear la tabla trains.

Ejecuta la ruta /seed-trains para insertar los datos iniciales.

Inicia el servidor:

node index.js


Abre en el navegador:

http://localhost:3000/login


Registra un usuario, inicia sesión y prueba la API /trenes.

8️⃣ Notas importantes

El array de trenes en memoria fue eliminado, ahora los datos son persistentes en MySQL.

/seed-trains solo se debe usar una vez.

Para actualizar datos, se puede usar SQL en MySQL Workbench o crear rutas API adicionales.