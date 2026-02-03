const request = require("supertest");
const app = require("../src/app");

// Tests relacionados con la ruta principal protegida
describe("Ruta protegida / (home)", () => {

  it("GET / redirige al login si no hay sesión", async () => {

    // Accedemos a la ruta principal sin estar logueados
    const res = await request(app).get("/");

    // El middleware de auth fuerza una redirección
    expect(res.statusCode).toBe(302);

    // Comprobamos que el destino es /login
    expect(res.headers.location).toBe("/login");
  });

});