const request = require("supertest");
const app = require("../src/app");
const { db } = require("../src/app"); // Importamos la conexión a la base de datos

describe("Auth API - Registro", () => {
  const usuarioPrueba = {
    username: "usuario_duplicado_test",
    password: "1234"
  };

  // Limpiamos el usuario antes de empezar para evitar falsos positivos
  beforeEach(async () => {
    await db.query("DELETE FROM users WHERE username = ?", [usuarioPrueba.username]);
  });

  // Limpieza final y cierre de conexión para que Jest no se quede colgado
  afterAll(async () => {
    await db.query("DELETE FROM users WHERE username = ?", [usuarioPrueba.username]);
    if (db && db.end) {
      await db.end();
    }
  });

  it("POST /register falla si el usuario ya existe", async () => {
    // 1. Primer registro: Creamos el usuario en la BD
    await request(app)
      .post("/register")
      .send(usuarioPrueba);

    // 2. Segundo registro con los mismos datos: Debe fallar por duplicado
    const res = await request(app)
      .post("/register")
      .send(usuarioPrueba);

    // El backend responde con 200
    expect(res.statusCode).toBe(200);

    // El mensaje debe indicar que el usuario ya existe
    expect(res.text).toMatch(/Usuario ya existe/);
  });
});