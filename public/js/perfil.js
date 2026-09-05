document.addEventListener('DOMContentLoaded', async () => {
  // 1. Manejo de Pestañas (Tabs)
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetEl = document.getElementById(`tab-${targetTab}`);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // 2. Cargar datos del usuario logueado
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const user = await res.json();
      const username = user.username || 'Usuario';

      const elTitle = document.getElementById('header-user-title');
      if (elTitle) elTitle.textContent = username.toUpperCase();
    } else {
      window.location.href = '/login';
      return;
    }
  } catch (err) {
    console.error('Error al cargar datos del usuario:', err);
  }

  // 3. Cargar el catálogo completo y las capturas del usuario
  await cargarCapturasPerfil();
});

// Cerrar menús desplegables al hacer clic fuera
document.addEventListener('click', () => {
  document.querySelectorAll('.options-dropdown').forEach(el => el.classList.remove('show'));
});

async function cargarCapturasPerfil() {
  try {
    const resCapturas = await fetch('/api/capturas/mis-capturas');
    const dataCapturas = await resCapturas.json();

    let totalTrenesBD = 0;
    try {
      const resTrenes = await fetch('/trenes');
      if (resTrenes.ok) {
        const trenes = await resTrenes.json();
        totalTrenesBD = trenes.length;
      }
    } catch (e) {
      console.warn('Error al obtener total de trenes:', e);
    }

    if (dataCapturas.ok) {
      const capturas = dataCapturas.capturas || [];
      const numCapturas = capturas.length;

      const elCazados = document.getElementById('stat-cazados');
      const elTotales = document.getElementById('stat-totales');
      const barraProgreso = document.getElementById('barra-progreso');

      if (elCazados) elCazados.textContent = numCapturas;
      if (elTotales) elTotales.textContent = totalTrenesBD || numCapturas;

      if (barraProgreso && totalTrenesBD > 0) {
        const porcentaje = Math.min(Math.round((numCapturas / totalTrenesBD) * 100), 100);
        barraProgreso.style.width = `${porcentaje}%`;
      }

      const contenedor = document.getElementById('galeria-capturas');
      if (contenedor) {
        if (numCapturas === 0) {
          contenedor.innerHTML = '<p class="empty-state">Aún no has registrado ningún avistamiento. Entra a la ficha de un tren para añadirlo a tu colección.</p>';
          return;
        }

        contenedor.innerHTML = capturas.map(item => {
          // Extraemos el ID exacto del tren (sirve tanto item.tren_id como item.id)
          const trenId = item.tren_id || item.id;
          const fechaISO = item.fecha_captura ? new Date(item.fecha_captura).toISOString().split('T')[0] : '';

          return `
            <div class="card-captura">
              <a href="/TrenCapturado.html?id=${trenId}" class="card-captura-link">
                <img src="${item.imagen_modelo || item.imagen || '/img/cargando/03-42-05-37_512.gif'}" alt="${item.serie || 'Tren'}">
              </a>

              <div class="card-captura-info">
                <div class="card-info-content">
                  <a href="/TrenCapturado.html?id=${trenId}" style="text-decoration: none; color: inherit;">
                    <h4>${item.serie ? 'SERIE ' + item.serie : item.nombre}</h4>
                  </a>
                  <p>📅 Capturado el: ${new Date(item.fecha_captura).toLocaleDateString('es-ES')}</p>
                </div>

                <div class="card-options-menu">
                  <button class="btn-menu-options" onclick="toggleMenuOptions(event, ${trenId})" title="Opciones">⋮</button>
                  <div id="menu-dropdown-${trenId}" class="options-dropdown">
                    <button class="btn-option-item" onclick="editarFechaCaptura(${trenId}, '${fechaISO}')">
                      ✏️ Cambiar fecha
                    </button>
                    <button class="btn-option-item btn-delete" onclick="eliminarCaptura(${trenId})">
                      🗑️ Eliminar captura
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Error al obtener capturas del perfil:', err);
  }
}

function toggleMenuOptions(event, trenId) {
  event.stopPropagation();
  
  document.querySelectorAll('.options-dropdown').forEach(el => {
    if (el.id !== `menu-dropdown-${trenId}`) {
      el.classList.remove('show');
    }
  });

  const menu = document.getElementById(`menu-dropdown-${trenId}`);
  if (menu) {
    menu.classList.toggle('show');
  }
}

// Acción para modificar la fecha
async function editarFechaCaptura(trenId, fechaActual) {
  const nuevaFecha = prompt('Introduce la nueva fecha de captura (AAAA-MM-DD):', fechaActual);
  if (!nuevaFecha || nuevaFecha === fechaActual) return;

  try {
    const res = await fetch('/api/capturas/modificar-fecha', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trenId, fecha_captura: nuevaFecha })
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      await cargarCapturasPerfil();
    } else {
      alert(data.error || 'No se pudo actualizar la fecha.');
    }
  } catch (error) {
    console.error('Error al modificar la fecha:', error);
  }
}

async function eliminarCaptura(trenId) {
  if (!confirm('¿Seguro que deseas eliminar este tren de tus capturas?')) return;

  try {
    const res = await fetch('/api/capturas/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trenId })
    });

    const data = await res.json();
    if (data.ok) {
      await cargarCapturasPerfil();
    } else {
      alert('Error al eliminar la captura.');
    }
  } catch (error) {
    console.error('Error al procesar la eliminación:', error);
  }
}