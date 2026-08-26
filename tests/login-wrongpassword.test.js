// Importamos supertest para simular peticiones HTTP
const request = require("supertest");

// Importamos la aplicación Express y la base de datos
const app = require("../src/app");
const { db } = require("../src/app");

// Agrupamos los tests relacionados con errores de login
describe("Auth API - Login (errores)", () => {
  const testUser = {
    username: "1",
    password: "123" // Contraseña correcta con la que se creará el usuario
  };

  // Preparamos la base de datos antes de ejecutar el test
  beforeEach(async () => {
    // 1. Limpiamos si el usuario '1' ya existe
    await db.query("DELETE FROM users WHERE username = ?", [testUser.username]);
    
    // 2. Registramos el usuario para garantizar que exista en la BD
    await request(app).post("/register").send(testUser);
  });

  // Limpieza al finalizar los tests
  afterAll(async () => {
    await db.query("DELETE FROM users WHERE username = ?", [testUser.username]);
    if (db && db.end) {
      await db.end(); // Cierra las conexiones para evitar el error de Jest
    }
  });

  // Test que comprueba que el login falla cuando la contraseña no es correcta
  it("POST /login falla si la contraseña es incorrecta", async () => {

    // Realizamos una petición POST al endpoint /login
    const res = await request(app)
      .post("/login")
      .send({
        username: "1",
        password: "incorrecta" // Contraseña errónea
      });

    // El backend responde con status 200
    expect(res.statusCode).toBe(200);

    // El texto de respuesta debe indicar el error exacto
    expect(res.text).toMatch(/Contraseña incorrecta/);
  });

});