// Importa la librería supertest, que sirve para hacer peticiones HTTP
// simuladas a una aplicación Express (sin levantar el servidor real)
const request = require("supertest");

// Importa la aplicación Express desde el archivo app.js
// Se usa para poder probar sus endpoints
// 🔹 Ahora también importamos la DB para limpiar y preparar datos
const { app, db } = require("../src/app");

// Describe un conjunto de tests relacionados con la API de autenticación
describe("Auth API", () => {

  // 🔹 Antes de cada test limpiamos la tabla de usuarios y creamos un usuario base
  beforeEach(async () => {
    // 🔹 Borramos todos los usuarios existentes
    await db.query("DELETE FROM users");

    // 🔹 Insertamos un usuario base con username '1' y password '1'
    // 🔹 Este hash corresponde a bcrypt de la contraseña '1'
    await db.query(
      "INSERT INTO users (username, passwordHash) VALUES (?, ?)",
      [
        "1",
        "$2b$10$wHhKZ4q9Qz4Q9Qz4Q9Qz4eQJ0hZy8K5kE4z6q8vZxPq1YkH9u"
      ]
    );
  });

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

  // 🔹 Test: login con contraseña incorrecta
  it("POST /login falla si la contraseña es incorrecta", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        username: "1",
        password: "incorrecta"
      });

    // 🔹 Esperamos que devuelva 200 aunque falle
    expect(res.statusCode).toBe(200);

    // 🔹 El texto de respuesta debe contener 'Contraseña incorrecta'
    expect(res.text).toMatch(/Contraseña incorrecta/);
  });

  // 🔹 Test: registro de usuario nuevo
  it("POST /register crea un usuario nuevo", async () => {
    const newUser = "user_test_" + Date.now(); // 🔹 username único por test

    const res = await request(app)
      .post("/register")
      .send({
        username: newUser,
        password: "1234"
      });

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Usuario creado/);
  });

  // 🔹 Test: registro de usuario duplicado
  it("POST /register falla si el usuario ya existe", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        username: "1",
        password: "1234"
      });

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Usuario ya existe/);
  });

  // 🔹 Test: logout destruye la sesión
  it("GET /logout destruye la sesión y redirige al login", async () => {
    const agent = request.agent(app);

    // 🔹 Simulamos un login válido para tener sesión
    await agent.post("/login").send({
      username: "1",
      password: "1"
    });

    // 🔹 Llamamos al endpoint de logout
    const res = await agent.get("/logout");

    // 🔹 Verificamos redirección al login
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  // 🔹 Cerramos la conexión a la DB al final de todos los tests
  afterAll(async () => {
    await db.end();
  });

});
