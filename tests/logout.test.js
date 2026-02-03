const request = require("supertest");
const app = require("../src/app");

// Tests relacionados con cerrar sesión
describe("Auth API - Logout", () => {

  it("GET /logout destruye la sesión y redirige al login", async () => {

    // Creamos un agent para mantener cookies/sesión
    const agent = request.agent(app);

    // Simulamos un login válido
    await agent.post("/login").send({
      username: "1",
      password: "1"
    });

    // Llamamos al endpoint de logout
    const res = await agent.get("/logout");

    // Express responde con redirección
    expect(res.statusCode).toBe(302);

    // Verificamos que redirige al login
    expect(res.headers.location).toBe("/login");
  });

});