const request = require("supertest");
const { app, db } = require("../src/app");

// Tests relacionados con el registro de usuarios
describe("Auth API - Registro", () => {

  // Limpieza al finalizar los tests para evitar fugas de conexiones en Jest
  afterAll(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  it("POST /register crea un usuario nuevo", async () => {

    // Generamos un nombre de usuario único
    // para evitar conflictos entre tests
    const newUser = "user_test_" + Date.now();

    // Enviamos los datos de registro con las claves correctas y tipo form
    const res = await request(app)
      .post("/register")
      .type("form")
      .send({
        usernameRegister: newUser,
        passwordRegister: "1234"
      });

    // El servidor responde correctamente
    expect(res.statusCode).toBe(200);

    // Verificamos el mensaje de éxito
    expect(res.text).toMatch(/Usuario creado/);

    // Limpiamos el usuario de prueba de la base de datos
    await db.query("DELETE FROM users WHERE username = ?", [newUser]);
  });

});