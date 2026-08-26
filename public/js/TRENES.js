const tabla = document.getElementById("tabla-trenes");
const buscador = document.getElementById("search");

let trenes = [];
// Cargar el nombre del usuario autenticado
document.addEventListener("DOMContentLoaded", () => {
  obtenerUsuarioLogueado();
});

async function obtenerUsuarioLogueado() {
  try {
    const response = await fetch("/api/me");
    if (response.ok) {
      const data = await response.json();
      const userSpan = document.getElementById("username-display");
      if (userSpan && data.username) {
        userSpan.textContent = data.username;
      }
    }
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  }
}

// Cargar datos desde la API
fetch("/trenes")
  .then(res => res.json())
  .then(data => {
    trenes = data;
    pintarTabla(trenes);
  });

function pintarTabla(lista) {
  tabla.innerHTML = "";

  lista.forEach(t => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${t.serie}</td>
      <td>${t.apodo}</td>
      <td>${t.tipo}</td>
      <td>${t.servicio}</td>
      <td>${t.operador}</td>
      <td>${t.zona}</td>
      <td>${t.logo}</td>
      <td>${t.descripcionVisual}</td>
    `;

    tabla.appendChild(fila);
  });
}

// Buscador
buscador.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  const filtrados = trenes.filter(t =>
    t.serie.toLowerCase().includes(texto) ||
    t.apodo.toLowerCase().includes(texto) ||
    t.operador.toLowerCase().includes(texto)
  );

  pintarTabla(filtrados);
});
