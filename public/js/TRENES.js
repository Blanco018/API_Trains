const tabla = document.getElementById("tabla-trenes");
const buscador = document.getElementById("search");

let trenes = [];

// Cargar el nombre del usuario autenticado al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
  obtenerUsuarioLogueado();
});

// Petición al endpoint /api/me para inyectar el nombre del usuario
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

// Cargar datos desde la API de trenes
fetch("/trenes")
  .then(res => res.json())
  .then(data => {
    trenes = data;
    pintarTabla(trenes);
  });

// Renderizar la tabla dinámica con logos, datos y redirección
function pintarTabla(lista) {
  tabla.innerHTML = "";

  lista.forEach(t => {
    const fila = document.createElement("tr");

    // Guardamos el ID del tren en el dataset de la fila
    fila.dataset.id = t.id;
    fila.style.cursor = "pointer";
    fila.title = "Haz clic para ver detalles del tren";

    // Generamos la etiqueta <img> si viene una ruta de imagen en t.logo
    const logoHTML = t.logo 
      ? `<img src="${t.logo}" alt="Logo ${t.operador}" class="img-logo">`
      : '<span>-</span>';

    fila.innerHTML = `
      <td>${t.serie}</td>
      <td>${t.apodo || '-'}</td>
      <td>${t.tipo}</td>
      <td>${t.servicio}</td>
      <td>${t.operador}</td>
      <td>${t.zona}</td>
      <td>${logoHTML}</td>
      <td>${t.descripcionVisual}</td>
    `;

    // Redirección a la vista de detalle pasando el ID por parámetro URL
    fila.addEventListener("click", () => {
      window.location.href = `/detalle.html?id=${t.id}`;
    });

    tabla.appendChild(fila);
  });
}

// Filtro en tiempo real del buscador
buscador.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  const filtrados = trenes.filter(t =>
    t.serie.toLowerCase().includes(texto) ||
    (t.apodo && t.apodo.toLowerCase().includes(texto)) ||
    t.operador.toLowerCase().includes(texto)
  );

  pintarTabla(filtrados);
});