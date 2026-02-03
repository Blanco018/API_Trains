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

------------------------------------------------
APARTADO SOBRE TESTS
------------------------------------------------

1️⃣ Test básico de la API (status.test.js)

Endpoint: /api/status
Método: GET
Objetivo: Comprobar que la API está activa y respondiendo correctamente.

Procedimiento:

Se realiza una petición GET a /api/status usando supertest.

Se comprueba que el código HTTP sea 200 (OK).

Se verifica que el cuerpo de la respuesta contenga la propiedad "message" con el valor "API Trenes funcionando".

Se imprime el statusCode en consola para confirmación visual.

Resultado esperado:

Código HTTP 200

JSON: { "message": "API Trenes funcionando" }

2️⃣ Tests de autenticación (auth.test.js)
POST /login falla si el usuario no existe

Endpoint: /login
Método: POST
Objetivo: Validar que el login falla correctamente cuando se ingresa un usuario inexistente.

Procedimiento:

Se realiza un POST a /login con un usuario que no está registrado y cualquier contraseña.

La respuesta indica que el usuario no existe.

Aunque el código HTTP sea 200, la autenticación falla internamente.

Resultado esperado:

Login no exitoso

Mensaje de error en el cuerpo de la respuesta

3️⃣ Rutas protegidas (protectedroutes.test.js)
Acceso sin sesión

Endpoint: /trenes
Método: GET
Objetivo: Verificar que las rutas protegidas requieren autenticación.

Procedimiento:

Se realiza un GET a /trenes sin iniciar sesión.

El middleware de autenticación detecta que no hay usuario logueado (req.session.user es undefined).

Se redirige automáticamente a /login.

Resultado esperado:

Código 302

Redirección a /login

Acceso con sesión

Endpoint: /trenes
Método: GET
Objetivo: Verificar que un usuario autenticado puede acceder a rutas protegidas.

Procedimiento:

Se crea un agent de supertest para mantener cookies y sesión.

Se realiza un POST a /login con un usuario válido y contraseña correcta.

Con el mismo agent, se realiza GET a /trenes.

Se comprueba que el código HTTP sea 200 y que la respuesta sea un array JSON.

Se imprime en consola la cantidad de trenes devueltos.

Resultado esperado:

Código 200

Array JSON con todos los trenes

4️⃣ Página principal y logout (sesion.test.js)
GET / sin sesión

Endpoint: /
Método: GET
Objetivo: Verificar que la página principal requiere autenticación.

Procedimiento:

Se realiza GET / sin sesión activa.

El middleware redirige automáticamente a /login.

Resultado esperado:

Código 302

Redirección a /login

GET / con sesión

Endpoint: /
Método: GET
Objetivo: Verificar que la página principal carga correctamente si el usuario está autenticado.

Procedimiento:

Se crea un agent de supertest para mantener sesión.

Se realiza login con un usuario válido.

Se realiza GET / usando la sesión activa.

Se comprueba que el código HTTP sea 200.

Se imprime el status en consola.

Resultado esperado:

Código 200

Página principal cargada correctamente

GET /logout

Endpoint: /logout
Método: GET
Objetivo: Verificar que el logout destruye la sesión correctamente.

Procedimiento:

Se realiza login con un usuario válido.

Se llama a /logout, que destruye la sesión.

Se comprueba que redirige a /login.

Se intenta acceder nuevamente a / → debe redirigir 302, confirmando que la sesión fue destruida.

Resultado esperado:

Logout exitoso

Redirección a /login

Acceso posterior a / → redirección 302

----- ENGLISH (TESTS) -----------
1️⃣ Basic API Test (status.test.js)

Endpoint: /api/status
Method: GET
Goal: Check that the API is active and responding correctly.

Procedure:

Make a GET request to /api/status using supertest.

Check that the HTTP status code is 200 (OK).

Verify that the response body has property "message" with value "API Trenes funcionando".

Log statusCode in console for visual confirmation.

Expected Result:

HTTP 200

JSON: { "message": "API Trenes funcionando" }

2️⃣ Authentication Tests (auth.test.js)
POST /login fails if user does not exist

Endpoint: /login
Method: POST
Goal: Validate that login fails when a non-existent user is provided.

Procedure:

POST /login with a user not in the database and any password.

Response indicates user does not exist.

Even if HTTP code is 200, authentication fails internally.

Expected Result:

Login unsuccessful

Error message in response body

3️⃣ Protected Routes (protectedroutes.test.js)
Access without session

Endpoint: /trenes
Method: GET
Goal: Verify that protected routes require authentication.

Procedure:

GET /trenes without an active session.

Middleware detects req.session.user is missing.

Redirects automatically to /login.

Expected Result:

Status 302

Redirect to /login

Access with session

Endpoint: /trenes
Method: GET
Goal: Verify that authenticated users can access protected routes.

Procedure:

Create a supertest agent to maintain cookies and session.

POST /login with a valid user and correct password.

GET /trenes using the same agent.

Check HTTP status 200 and that the response is a JSON array.

Log the number of trains returned in console.

Expected Result:

Status 200

JSON array of all trains

4️⃣ Home Page and Logout (sesion.test.js)
GET / without session

Endpoint: /
Method: GET
Goal: Verify that the home page requires authentication.

Procedure:

GET / without an active session.

Middleware redirects automatically to /login.

Expected Result:

Status 302

Redirect to /login

GET / with session

Endpoint: /
Method: GET
Goal: Verify that the home page loads correctly if the user is authenticated.

Procedure:

Create a supertest agent to maintain session.

Login with a valid user.

GET / using the active session.

Check HTTP status 200.

Log status in console.

Expected Result:

Status 200

Home page loads correctly

GET /logout

Endpoint: /logout
Method: GET
Goal: Verify that logout destroys the session correctly.

Procedure:

Login with a valid user.

Call /logout, which destroys the session.

Check that it redirects to /login.

Attempt to access / again → should redirect 302, confirming the session is gone.

Expected Result:

Logout successful

Redirect to /login

Subsequent access to / → redirect 302

💡 Additional Notes for README:

All tests use supertest to simulate HTTP requests without starting the server.

Login tests use bcrypt for validating dynamic passwords.

Protected routes are tested with a supertest agent that maintains session and cookies.

Key information is logged in console for debugging.

Database is reset before each test to ensure isolation and reproducibility.
