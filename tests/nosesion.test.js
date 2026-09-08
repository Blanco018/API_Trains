// Importamos supertest para simular peticiones HTTP y la base de datos para cierre limpio
const request = require("supertest");
const { app, db } = require("../src/app");

// Tests relacionados con la ruta principal protegida
describe("Ruta protegida / (home)", () => {

  // Limpieza al finalizar los tests para evitar que Jest se quede colgado
  afterAll(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  it("GET / redirige al login si no hay sesión", async () => {

    // Accedemos a la ruta principal sin estar logueados
    const res = await request(app).get("/");

    // El middleware de auth fuerza una redirección
    expect(res.statusCode).toBe(302);

    // Comprobamos que el destino es /login
    expect(res.headers.location).toBe("/login");
  });

});