const request = require("supertest");
const { app, db } = require("../src/app");

describe("Auth API", () => {

  beforeEach(async () => {
    // Vaciamos la tabla para aislar cada prueba
    await db.query("DELETE FROM users");

    // Insertamos usuario base (username '1', password '1')
    await db.query(
      "INSERT INTO users (username, passwordHash) VALUES (?, ?)",
      ["1", "$2b$10$wHhKZ4q9Qz4Q9Qz4Q9Qz4eQJ0hZy8K5kE4z6q8vZxPq1YkH9u"]
    );
  });

  // 🔹 Test 1: LOGIN CON USUARIO INEXISTENTE
  it("POST /login falla si el usuario no existe", async () => {
    const res = await request(app)
      .post("/login")
      .type("form")
      .send({
        usernameLogIn: "usuario_inexistente",
        passwordLogIn: "1234"
      });

    expect(res.text).toBe("Usuario no encontrado");
  });

  // 🔹 Test 2: LOGIN CON CONTRASEÑA INCORRECTA
  it("POST /login falla si la contraseña es incorrecta", async () => {
    const res = await request(app)
      .post("/login")
      .type("form")
      .send({
        usernameLogIn: "1",
        passwordLogIn: "incorrecta"
      });

    expect(res.text).toBe("Contraseña incorrecta");
  });

  // 🔹 Test 3: REGISTRO DE UN NUEVO USUARIO
  it("POST /register crea un usuario nuevo", async () => {
    const newUser = "user_test_" + Date.now();

    const res = await request(app)
      .post("/register")
      .type("form")
      .send({
        usernameRegister: newUser,
        passwordRegister: "1234"
      });

    // 1. Verificamos respuesta de la API (Status 200 y OK en JSON)
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);

    // 2. Verificamos la creación real en la BD local de test
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [newUser]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].username).toBe(newUser);
  });

  // 🔹 Test 4: REGISTRO DUPLICADO
  it("POST /register falla si el usuario ya existe", async () => {
    const res = await request(app)
      .post("/register")
      .type("form")
      .send({
        usernameRegister: "1",
        passwordRegister: "1234"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("El usuario ya existe");
  });

  // 🔹 Test 5: CIERRE DE SESIÓN
  it("GET /logout destruye la sesión y redirige al login", async () => {
    const agent = request.agent(app);

    await agent
      .post("/login")
      .type("form")
      .send({
        usernameLogIn: "1",
        passwordLogIn: "1"
      });

    const res = await agent.get("/logout");

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  afterAll(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

});