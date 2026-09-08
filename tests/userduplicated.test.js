const request = require("supertest");
const { app, db } = require("../src/app"); // Importamos la app y la conexión a la base de datos

describe("Auth API - Registro Duplicado", () => {
  const usuarioPrueba = {
    usernameRegister: "usuario_duplicado_test",
    passwordRegister: "1234"
  };

  // Limpiamos el usuario antes de empezar para evitar falsos positivos
  beforeEach(async () => {
    await db.query("DELETE FROM users WHERE username = ?", [usuarioPrueba.usernameRegister]);
  });

  // Limpieza final y cierre de conexión para que Jest no se quede colgado
  afterAll(async () => {
    await db.query("DELETE FROM users WHERE username = ?", [usuarioPrueba.usernameRegister]);
    if (db && db.end) {
      await db.end();
    }
  });

  it("POST /register falla si el usuario ya existe", async () => {
    // 1. Primer registro: Creamos el usuario en la BD
    await request(app)
      .post("/register")
      .type("form")
      .send(usuarioPrueba);

    // 2. Segundo registro con los mismos datos: Debe fallar por duplicado
    const res = await request(app)
      .post("/register")
      .type("form")
      .send(usuarioPrueba);

    // El backend responde con status 400 (Bad Request)
    expect(res.statusCode).toBe(400);

    // Verificamos directamente la estructura JSON de la respuesta
    expect(res.body).toEqual({
      ok: false,
      message: "El usuario ya existe"
    });
  });
});