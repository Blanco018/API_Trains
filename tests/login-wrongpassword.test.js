// Importamos supertest para simular peticiones HTTP
const request = require("supertest");

// Importamos la aplicación Express y la base de datos
const app = require("../src/app");
const { db } = require("../src/app");

// Agrupamos los tests relacionados con errores de login
describe("Auth API - Login (errores)", () => {

  // Preparamos la base de datos antes de ejecutar el test
  beforeEach(async () => {
    // 1. Limpiamos la tabla de usuarios para garantizar aislamiento
    await db.query("DELETE FROM users");
    
    // 2. Insertamos el usuario base directamente en la BD con su hash correspondiente
    await db.query(
      "INSERT INTO users (username, passwordHash) VALUES (?, ?)",
      ["1", "$2b$10$wHhKZ4q9Qz4Q9Qz4Q9Qz4eQJ0hZy8K5kE4z6q8vZxPq1YkH9u"]
    );
  });

  // Limpieza al finalizar los tests
  afterAll(async () => {
    if (db && db.end) {
      await db.end(); // Cierra las conexiones para evitar el error de Jest
    }
  });

  // Test que comprueba que el login falla cuando la contraseña no es correcta
  it("POST /login falla si la contraseña es incorrecta", async () => {

    // Realizamos una petición POST al endpoint /login
    const res = await request(app)
      .post("/login")
      .type("form") // 🔹 Necesario para que Express lea el body como formulario
      .send({
        usernameLogIn: "1",        // 🔹 Clave correcta esperada por el controlador
        passwordLogIn: "incorrecta" // Contraseña errónea
      });

    // El backend responde con el texto plano indicado
    expect(res.text).toMatch(/Contraseña incorrecta/);
  });

});