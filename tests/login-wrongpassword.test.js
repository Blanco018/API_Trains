// Importamos supertest para simular peticiones HTTP
const request = require("supertest");

// Importamos la aplicación Express (sin levantar servidor)
const app = require("../src/app");

// Agrupamos los tests relacionados con errores de login
describe("Auth API - Login (errores)", () => {

  // Test que comprueba que el login falla
  // cuando la contraseña no es correcta
  it("POST /login falla si la contraseña es incorrecta", async () => {

    // Realizamos una petición POST al endpoint /login
    const res = await request(app)
      .post("/login")
      .send({
        // Usuario existente
        username: "1",
        // Contraseña incorrecta
        password: "incorrecta"
      });

    // El backend responde (aunque sea error lógico)
    expect(res.statusCode).toBe(200);

    // El texto de respuesta debe indicar el error
    expect(res.text).toMatch(/Contraseña incorrecta/);
  });

});
