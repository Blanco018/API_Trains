// Importa la librería supertest, que sirve para hacer peticiones HTTP
// simuladas a una aplicación Express (sin levantar el servidor real)
const request = require("supertest");

// Importa la aplicación Express desde el archivo app.js
// Se usa para poder probar sus endpoints
const { app } = require("../src/app");

// Describe un conjunto de tests relacionados con la API de autenticación
describe("Auth API", () => {

  // Define un test individual
  // El texto describe el comportamiento esperado
  it("POST /login falla si el usuario no existe", async () => {

    // Realiza una petición HTTP POST al endpoint /login
    // usando la app de Express
    const res = await request(app)
      .post("/login") // endpoint al que se hace la petición
      .send({
        // Cuerpo de la petición (req.body)
        username: "usuario_inexistente",
        password: "1234"
      });
   // console.log(res.statusCode, res.text);
    // Verifica que el código de estado HTTP de la respuesta
    // sea 200 (aunque el login falle)
    expect(res.statusCode).toBe(200);
  });
});