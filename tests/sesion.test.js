// Importamos Supertest
// Nos permite simular peticiones HTTP a Express
// sin necesidad de levantar el servidor real
const request = require("supertest");

// Importamos bcrypt para generar el hash dinámico
const bcrypt = require("bcrypt");

// Importamos la app de Express y la DB
// NO importamos server.js porque los tests
// no deben abrir puertos ni arrancar el servidor
const { app, db } = require("../src/app");

// Describe agrupa todos los tests relacionados con la sesión
describe("Ruta protegida / (home) y /logout", () => {

  // 🔹 Antes de cada test limpiamos la tabla de usuarios y creamos uno base
  beforeEach(async () => {
    // 🔹 CAMBIO: Borramos únicamente el usuario de prueba '1' en lugar de toda la tabla
    // Esto previene errores de clave duplicada si hay operaciones concurrentes
    await db.query("DELETE FROM users WHERE username = ?", ["1"]);

    // 🔹 Generamos hash dinámico de password '1'
    const hash = await bcrypt.hash("1", 10);

    // 🔹 Insertamos un usuario base con username '1' y password '1'
    await db.query(
      "INSERT INTO users (username, passwordHash) VALUES (?, ?)",
      ["1", hash]
    );
  });

  // -----------------------------
  // TEST 1: acceso a / sin sesión
  // -----------------------------
  it("GET / redirige al login si no hay sesión", async () => {
    // Hacemos GET / sin login
    const res = await request(app).get("/");

    // Como authMiddleware redirige al login
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  // -----------------------------
  // TEST 2: acceso a / con sesión
  // -----------------------------
  it("GET / devuelve la página principal si hay sesión", async () => {
    // 🔹 Creamos un agent para mantener la sesión
    const agent = request.agent(app);

    // 🔹 Hacemos login primero
    const loginRes = await agent.post("/login").send({
      username: "1",
      password: "1"
    });
    console.log("✅ LOGIN COMPLETADO - status:", loginRes.statusCode);

    // 🔹 Accedemos a / con sesión
    const res = await agent.get("/");

    // 🔹 Ahora sí debe devolver 200 porque tenemos sesión
    console.log("🏠 ACCESO A / - status:", res.statusCode);
    expect(res.statusCode).toBe(200);
  });

  // -----------------------------
  // TEST 3: logout destruye la sesión
  // -----------------------------
  it("GET /logout destruye la sesión y redirige al login", async () => {
    const agent = request.agent(app);

    // 🔹 Hacemos login para crear la sesión
    await agent.post("/login").send({
      username: "1",
      password: "1"
    });

    // 🔹 Llamamos al endpoint de logout
    const res = await agent.get("/logout");

    // 🔹 Debe redirigir al login
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/login");

    // 🔹 Verificamos que la sesión ya no permite acceder a /
    const res2 = await agent.get("/");
    expect(res2.statusCode).toBe(302);
    expect(res2.headers.location).toBe("/login");
  });

  // 🔹 Cerramos la conexión a la DB al final de todos los tests
  afterAll(async () => {
    // 🔹 CAMBIO: Limpiamos el usuario de prueba creado antes de cerrar la conexión
    await db.query("DELETE FROM users WHERE username = ?", ["1"]);
    await db.end();
  });

});