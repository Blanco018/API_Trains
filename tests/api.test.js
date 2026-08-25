// Importamos supertest, una librería que permite hacer peticiones HTTP
// a una app de Express SIN levantar el servidor (no usa app.listen)
const request = require("supertest");

// Importamos nuestra aplicación Express
// OJO: es el app, no el servidor escuchando en un puerto
const app = require("../src/app");

// Describe agrupa tests relacionados
describe("Test básico de la API", () => {

  // test() define un test individual
  test("La API responde correctamente", async () => {

    // Hacemos una petición GET a la ruta /api/status
    // request(app) simula un cliente HTTP
    // await espera la respuesta antes de seguir
    const res = await request(app).get("/api/status");

    // Mostramos en la terminal el código de estado recibido
    // Esto se verá al ejecutar: npm test
    console.log("STATUS CODE RECIBIDO:", res.statusCode);

    // Comprobamos que el código HTTP sea 200 (OK)
    expect(res.statusCode).toBe(200);

    // Comprobamos que el cuerpo de la respuesta tenga
    // una propiedad llamada "message"
    expect(res.body).toHaveProperty("message");

    // Comprobamos que el valor de message sea exactamente el esperado
    expect(res.body.message).toBe("API Trenes funcionando");
  });
});
