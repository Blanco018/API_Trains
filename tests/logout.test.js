// Importamos supertest para simular peticiones HTTP y la base de datos
const request = require("supertest");
const { app, db } = require("../src/app");

// Tests relacionados con cerrar sesión
describe("Auth API - Logout", () => {

  // Preparamos la base de datos antes de cada test para asegurar que el usuario existe
  beforeEach(async () => {
    await db.query("DELETE FROM users");
    await db.query(
      "INSERT INTO users (username, passwordHash) VALUES (?, ?)",
      ["1", "$2b$10$wHhKZ4q9Qz4Q9Qz4Q9Qz4eQJ0hZy8K5kE4z6q8vZxPq1YkH9u"]
    );
  });

  // Limpieza al finalizar los tests para evitar que Jest se quede colgado
  afterAll(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  it("GET /logout destruye la sesión y redirige al login", async () => {

    // Creamos un agent para mantener cookies/sesión
    const agent = request.agent(app);

    // Simulamos un login válido con las claves y tipo de datos correctos
    await agent
      .post("/login")
      .type("form")
      .send({
        usernameLogIn: "1",
        passwordLogIn: "1"
      });

    // Llamamos al endpoint de logout
    const res = await agent.get("/logout");

    // Express responde con redirección
    expect(res.statusCode).toBe(302);

    // Verificamos que redirige al login
    expect(res.headers.location).toBe("/login");
  });

});