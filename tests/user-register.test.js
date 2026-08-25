const request = require("supertest");
const app = require("../src/app");

// Tests relacionados con el registro de usuarios
describe("Auth API - Registro", () => {

  it("POST /register crea un usuario nuevo", async () => {

    // Generamos un nombre de usuario único
    // para evitar conflictos entre tests
    const newUser = "user_test_" + Date.now();

    // Enviamos los datos de registro
    const res = await request(app)
      .post("/register")
      .send({
        username: newUser,
        password: "1234"
      });

    // El servidor responde correctamente
    expect(res.statusCode).toBe(200);

    // Verificamos el mensaje de éxito
    expect(res.text).toMatch(/Usuario creado/);
  });

});