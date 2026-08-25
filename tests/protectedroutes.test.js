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

// 'describe' agrupa todos los tests relacionados
// con la ruta /trenes
describe("Ruta protegida /trenes", () => {

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
  // TEST 1: acceso SIN login
  // -----------------------------
  it("Debe redirigir al login si no hay sesión", async () => {
    // Hacemos una petición GET a /trenes
    // sin haber iniciado sesión
    const res = await request(app).get("/trenes");

    // Como tu authMiddleware hace:
    // res.redirect("/login")
    // Express responde con código 302 (redirect)
    expect(res.statusCode).toBe(302);

    // Comprobamos que la redirección
    // va realmente a /login
    expect(res.headers.location).toBe("/login");
  });

  // -----------------------------
  // TEST 2: acceso CON login
  // -----------------------------
  it("Debe devolver los trenes si el usuario está autenticado", async () => {

    // Creamos un 'agent' de Supertest.
    // El agent es MUY importante porque:
    // - mantiene cookies
    // - mantiene la sesión entre peticiones
    const agent = request.agent(app);

    // 1️⃣ Simulamos un login válido
    // Esto crea una sesión en Express
    const loginResponse = await agent
      .post("/login")
      .send({
        username: "1",
        password: "1"
      });
    // Log para confirmar que el login se ejecutó
    console.log("✅ LOGIN COMPLETADO - status:", loginResponse.statusCode);

    // 2️⃣ Ahora accedemos a /trenes
    // usando EL MISMO agent (misma sesión)
    const res = await agent.get("/trenes");

    // Log final: flujo E2E completo
    console.log("🚆 E2E COMPLETADO - Trenes devueltos:", res.body.length);

    // Si la sesión existe, authMiddleware
    // deja pasar la petición
    expect(res.statusCode).toBe(200);

    // Comprobamos que la respuesta es JSON
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 🔹 Cerramos la conexión a la DB al final de todos los tests
  afterAll(async () => {
    // 🔹 CAMBIO: Limpiamos el usuario de prueba creado antes de cerrar la conexión
    await db.query("DELETE FROM users WHERE username = ?", ["1"]);
    await db.end();
  });

});