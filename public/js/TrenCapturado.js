document.addEventListener('DOMContentLoaded', async () => {
  // 1. Obtener el ID del tren desde la URL (?id=X)
  const urlParams = new URLSearchParams(window.location.search);
  const trenId = urlParams.get('id');

  if (!trenId) {
    alert('No se especificó ningún tren.');
    window.location.href = '/';
    return;
  }

  // 2. Cargar la información general del tren y las publicaciones
  await cargarDetallesTren(trenId);
  await cargarPublicacionesComunidad(trenId);

  // 3. Configurar el evento de envío del formulario para publicar una captura
  const formSubir = document.getElementById('form-subir-captura');
  if (formSubir) {
    formSubir.addEventListener('submit', (e) => manejarSubidaCaptura(e, trenId));
  }
});

// Carga la información de la ficha superior
async function cargarDetallesTren(trenId) {
  try {
    const res = await fetch(`/trenes/${trenId}`);
    if (!res.ok) throw new Error('No se pudo obtener la información del tren');
    
    const tren = await res.json();

    const elTituloHeader = document.getElementById('tren-titulo-header');
    const elModeloHeader = document.getElementById('tren-modelo-header');
    const elNombre = document.getElementById('tren-nombre');
    const elDescripcion = document.getElementById('tren-descripcion');
    const elImagen = document.getElementById('tren-imagen-principal');

    const nombreSerie = tren.serie ? `Serie ${tren.serie}` : (tren.nombre || 'Tren');
    
    // Mapeo flexible para capturar la descripción desde distintas propiedades de la BD
    const descTexto = tren.descripcion || tren.detalles || tren.info || tren.texto || 'Sin descripción disponible.';

    if (elTituloHeader) elTituloHeader.textContent = nombreSerie.toUpperCase();
    if (elModeloHeader) elModeloHeader.textContent = tren.modelo || tren.tipo || 'TREN';
    if (elNombre) elNombre.textContent = nombreSerie;
    if (elDescripcion) elDescripcion.textContent = descTexto;
    if (elImagen) elImagen.src = tren.imagen_modelo || tren.imagen || '/img/no-image.png';

  } catch (err) {
    console.error('Error al cargar detalles del tren:', err);
  }
}

// Carga el muro/feed de imágenes subidas por los usuarios
async function cargarPublicacionesComunidad(trenId) {
  const contenedor = document.getElementById('grid-publicaciones');
  if (!contenedor) return;

  try {
    const res = await fetch(`/api/capturas/comunidad/${trenId}`);
    if (!res.ok) {
      contenedor.innerHTML = '<p class="empty-state">No hay capturas registradas para este tren todavía. ¡Sé el primero en publicar una!</p>';
      return;
    }

    const publicaciones = await res.json();

    if (!publicaciones || publicaciones.length === 0) {
      contenedor.innerHTML = '<p class="empty-state">No hay capturas registradas para este tren todavía. ¡Sé el primero en publicar una!</p>';
      return;
    }

    contenedor.innerHTML = publicaciones.map(pub => {
      const fecha = pub.fecha_subida ? new Date(pub.fecha_subida).toLocaleDateString('es-ES') : '';
      const likedClass = pub.user_liked ? 'liked' : '';

      return `
        <article class="card-publicacion-comunidad" id="pub-card-${pub.id}">
          <div class="pub-header">
            <span class="pub-usuario">@${pub.username || 'Anónimo'}</span>
            <span class="pub-fecha">${fecha}</span>
          </div>
          
          <img src="${pub.imagen_url}" alt="Captura de ${pub.username}" class="pub-imagen">
          
          <div class="pub-body">
            <p class="pub-comentario">${pub.comentario || ''}</p>
            
            <div class="pub-acciones">
              <button class="btn-like ${likedClass}" onclick="toggleLike(${pub.id})">
                ❤️ <span id="like-count-${pub.id}">${pub.likes_count || 0}</span> Likes
              </button>
            </div>

            <div class="pub-comentarios-seccion">
              <div class="lista-comentarios" id="lista-comentarios-${pub.id}">
                ${renderizarComentarios(pub.comentarios || [])}
              </div>
              <div class="form-add-comentario">
                <input type="text" id="input-comentario-${pub.id}" placeholder="Escribe un comentario..." class="input-comentario-texto">
                <button class="btn-enviar-comentario" onclick="enviarComentario(${pub.id})">Enviar</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error('Error al cargar publicaciones:', err);
    contenedor.innerHTML = '<p class="empty-state">Ocurrió un error al cargar las publicaciones de la comunidad.</p>';
  }
}

// Renderiza los comentarios individuales de cada tarjeta
function renderizarComentarios(comentarios) {
  if (!comentarios || comentarios.length === 0) {
    return '<p class="empty-state" style="font-size:0.8rem; padding:4px;">Sin comentarios aún.</p>';
  }
  return comentarios.map(c => `
    <div class="comentario-item">
      <strong>@${c.username}:</strong> ${c.texto}
    </div>
  `).join('');
}

// Maneja el envío del formulario con FormData (Soporte para subir imagen con Multer)
async function manejarSubidaCaptura(e, trenId) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  formData.append('trenId', trenId);

  try {
    const res = await fetch('/api/capturas/subir', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      form.reset();
      await cargarPublicacionesComunidad(trenId);
    } else {
      alert(data.error || 'Error al publicar la captura.');
    }
  } catch (err) {
    console.error('Error al subir la captura:', err);
    alert('Ocurrió un fallo en el servidor al intentar subir la imagen.');
  }
}

// Dar o quitar Like a una publicación
async function toggleLike(publicacionId) {
  try {
    const res = await fetch(`/api/capturas/publicaciones/${publicacionId}/like`, {
      method: 'POST'
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      const btnLike = document.querySelector(`#pub-card-${publicacionId} .btn-like`);
      const spanCount = document.getElementById(`like-count-${publicacionId}`);

      if (btnLike && spanCount) {
        spanCount.textContent = data.likes_count;
        if (data.liked) {
          btnLike.classList.add('liked');
        } else {
          btnLike.classList.remove('liked');
        }
      }
    }
  } catch (err) {
    console.error('Error al procesar el like:', err);
  }
}

// Publicar un nuevo comentario en una tarjeta
async function enviarComentario(publicacionId) {
  const input = document.getElementById(`input-comentario-${publicacionId}`);
  if (!input || !input.value.trim()) return;

  const texto = input.value.trim();

  try {
    const res = await fetch(`/api/capturas/publicaciones/${publicacionId}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      input.value = '';
      const contenedorComentarios = document.getElementById(`lista-comentarios-${publicacionId}`);
      if (contenedorComentarios) {
        contenedorComentarios.innerHTML = renderizarComentarios(data.comentarios);
      }
    } else {
      alert(data.error || 'No se pudo enviar el comentario.');
    }
  } catch (err) {
    console.error('Error al enviar el comentario:', err);
  }
}