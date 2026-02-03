const request = require("supertest");
const app = require("../src/app");

// Tests de errores en el registro
describe("Auth API - Registro", () => {

  it("POST /register falla si el usuario ya existe", async () => {

    // Intentamos registrar un usuario existente
    const res = await request(app)
      .post("/register")
      .send({
        username: "1",
        password: "1234"
      });

    // El backend responde sin romperse
    expect(res.statusCode).toBe(200);

    // El mensaje debe indicar que el usuario ya existe
    expect(res.text).toMatch(/Usuario ya existe/);
  });

});