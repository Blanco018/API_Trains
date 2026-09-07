Markdown# 🚆 TrenDex - API y Gestión de Trenes

Aplicación web y API RESTful para la gestión, visualización y clasificación de trenes y material rodante. Cuenta con autenticación de usuarios basada en sesiones, rutas protegidas, renderizado dinámico y persistencia de datos en MySQL.

---

## ⚙️ Requisitos Previos

* **Node.js**: $\ge$ 14.x
* **MySQL**: $\ge$ 8.0
* **npm** o **yarn**

---

## 🚀 Instalación y Configuración

### 1️⃣ Clonar el repositorio y configurar variables del entorno

Crea un archivo `.env` en la raíz del proyecto con tus credenciales locales de MySQL:

.env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=api_tren
DB_PORT=3306
SESSION_SECRET=secreto_para_sesion

Instala las dependencias del proyecto:Bashnpm install
2️⃣ Inicializar la Base de DatosAbre tu gestor de base de datos (MySQL Workbench, DBeaver, CLI) y crea el esquema:SQLCREATE DATABASE api_tren;
Arranca el servidor para habilitar los endpoints de inicialización:Bashnpm start
# o node src/app.js
Crear tablas e insertar datos base:Ejecuta en tu navegador o cliente HTTP la ruta de creación de tabla:GET http://localhost:3000/create-trains-tableEjecuta la ruta para poblar la base de datos desde el dataset local (trenes.json):GET http://localhost:3000/seed-trains (Ejecutar solo una vez)🎨 Arquitectura del Proyecto y Estilos (CSS)El frontend utiliza una arquitectura CSS modular coordinada desde un orquestador principal:Plaintextpublic/
├── css/
│   ├── main.css              <-- Orquestador de imports y variables globales
│   └── vistas/
│       ├── Login.css         <-- Estilos de inicio de sesión y registro
│       ├── listado.css       <-- Estilos de la galería principal de trenes
│       └── detalles.css      <-- Estilos de la ficha de detalle de unidad
Para vincular los estilos en cualquier vista HTML, solo se requiere incluir:HTML<link rel="stylesheet" href="/css/main.css">
📌 Rutas de la Aplicación🔑 Autenticación de UsuariosMétodoRutaDescripciónGET/loginRenderiza la vista de Login y RegistroPOST/registerRegistra un nuevo usuario (Contraseña encriptada con bcrypt)POST/loginAutentica al usuario y crea la sesiónGET/logoutDestruye la sesión activa y redirige al login🚆 API y Vistas ProtegidasNota: Las rutas principales requieren que el usuario esté autenticado (req.session.user).MétodoRutaDescripciónGET/Página principal (Listado interactivo de trenes)GET/api/trenesRetorna el listado completo de trenes en formato JSONGET/api/trenes/:idRetorna la información detallada de un tren específicoGET/api/meObtiene la información del usuario autenticado en la sesión🧪 Suite de Pruebas (Tests)Las pruebas están automatizadas con Jest y Supertest para validar el comportamiento del backend sin necesidad de levantar manualmente el servidor HTTP.Para ejecutar los tests:Bashnpm test
📋 Cobertura de Tests1️⃣ Estado de la API (status.test.js)GET /api/status: Comprueba disponibilidad del servicio.Esperado: Estado HTTP 200 y cuerpo { "message": "API Trenes funcionando" }.2️⃣ Autenticación (auth.test.js)POST /login: Valida credenciales erróneas o usuarios inexistentes.Esperado: Respuesta indicando fallo de autenticación de forma segura.3️⃣ Rutas Protegidas (protectedroutes.test.js)Acceso no autenticado: Verifica redirecciones a /login al intentar consultar /api/trenes sin sesión (HTTP 302).Acceso autenticado: Utiliza un agente persistente (supertest.agent) para verificar que un usuario logueado obtiene el listado JSON de la API con código HTTP 200.4️⃣ Gestión de Sesión (sesion.test.js)Navegación protegida: Verifica el bloqueo en / sin sesión activa.Cierre de sesión (GET /logout): Confirma la destrucción completa de la cookie de sesión y bloquea intentos de acceso posteriores.🛠️ Modos de DesarrolloPara iniciar el servidor en modo desarrollo con recarga automática:Bashnpm run dev
📄 Notas AdicionalesLa persistencia de datos fue migrada por completo de arrays en memoria local a tablas relacionales MySQL.Las consultas de detalle (/api/trenes/:id) devuelven el esquema dinámico de la base de datos permitiendo la renderización modular en cliente.

----------------------------------------------------------------------------
----------------------------------------------------------------------------

# 🚆 TrenDex - API & Train Management

A web application and RESTful API for managing, visualizing, and classifying trains and rolling stock. Features session-based user authentication, protected routes, dynamic rendering, and data persistence with MySQL.

---

## ⚙️ Prerequisites

* **Node.js**: >= 14.x
* **MySQL**: >= 8.0
* **npm** or **yarn**

---

## 🚀 Setup & Installation

### 1️⃣ Clone the repository & configure environment variables

Create a `.env` file in the root directory with your local MySQL credentials:

.env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=api_tren
DB_PORT=3306
SESSION_SECRET=your_session_secret
Install project dependencies:Bashnpm install
2️⃣ Initialize the DatabaseOpen your database manager (MySQL Workbench, DBeaver, CLI) and create the schema:SQLCREATE DATABASE api_tren;
Start the server to enable initialization endpoints:Bashnpm start
# or node src/app.js
Create tables and seed initial data:Run the table creation endpoint in your browser or HTTP client:GET http://localhost:3000/create-trains-tableRun the seed endpoint to populate the database from the local dataset (trenes.json):GET http://localhost:3000/seed-trains (Run only once)🎨 Project Architecture & CSS StylesThe frontend uses a modular CSS architecture coordinated from a main orchestrator file:Plaintextpublic/
├── css/
│   ├── main.css              <-- Orchestrator for imports and global variables
│   └── vistas/
│       ├── Login.css         <-- Login and Registration styles
│       ├── listado.css       <-- Main train gallery styles
│       └── detalles.css      <-- Train detail view styles
To include styles in any HTML view, simply link the orchestrator:HTML<link rel="stylesheet" href="/css/main.css">
📌 Application Routes🔑 User AuthenticationMethodRouteDescriptionGET/loginRenders the Login and Registration pagePOST/registerRegisters a new user (Password hashed with bcrypt)POST/loginAuthenticates the user and creates a sessionGET/logoutDestroys the active session and redirects to login🚆 API & Protected ViewsNote: Main routes require the user to be authenticated (req.session.user).MethodRouteDescriptionGET/Main page (Interactive train list)GET/api/trenesReturns the complete train list in JSON formatGET/api/trenes/:idReturns detailed information for a specific trainGET/api/meFetches authenticated user details from the session🧪 Test SuiteTests are automated using Jest and Supertest to validate backend behavior without manually running the HTTP server.Run the tests:Bashnpm test
📋 Test Coverage1️⃣ API Status (status.test.js)GET /api/status: Checks service availability.Expected: HTTP Status 200 and body { "message": "API Trenes funcionando" }.2️⃣ Authentication (auth.test.js)POST /login: Validates incorrect credentials or non-existent users.Expected: Secure authentication failure response.3️⃣ Protected Routes (protectedroutes.test.js)Unauthenticated Access: Verifies redirects to /login when fetching /api/trenes without a session (HTTP 302).Authenticated Access: Uses a persistent agent (supertest.agent) to verify an authenticated user receives the JSON train list with HTTP 200.4️⃣ Session Management (sesion.test.js)Protected Navigation: Verifies restriction on / without an active session.Logout (GET /logout): Confirms complete destruction of the session cookie and blocks subsequent access.🛠️ Development ModesTo start the server with auto-reload enabled:Bashnpm run dev
📄 Additional NotesData persistence has been fully migrated from in-memory arrays to MySQL relational tables.Detail queries (/api/trenes/:id) return dynamic schema data enabling client-side modular rendering.
