class DetalleTren {
  constructor() {
    this.params = new URLSearchParams(window.location.search);
    this.idTren = this.params.get('id');
    
    // Referencias al DOM
    this.elNombre = document.getElementById('nombreTren');
    this.elImg = document.getElementById('imgTren');
    this.elDesc = document.getElementById('descTren');
    this.elUser = document.getElementById('username-display');
    this.btnCapturar = document.getElementById('btn-capturar-tren'); // Botón de captura
  }

  async init() {
    // 1. Cargar el nombre de usuario autenticado
    await this.obtenerUsuarioLogueado();

    // 2. Cargar la información del tren si hay ID
    if (!this.idTren) {
      console.warn('No se ha proporcionado un ID de tren.');
      if (this.elNombre) this.elNombre.textContent = 'Tren no especificado';
      return;
    }

    await this.cargarDetalles();
    await this.comprobarEstadoCaptura();
    this.escucharEventoCaptura();
  }

  async obtenerUsuarioLogueado() {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        const data = await response.json();
        if (this.elUser && data.username) {
          this.elUser.textContent = data.username;
        }
      } else if (this.elUser) {
        this.elUser.textContent = 'Invitado';
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      if (this.elUser) this.elUser.textContent = 'Error';
    }
  }

  async cargarDetalles() {
    try {
      // Ajustado al endpoint que usas en backend (/trenes/:id)
      const response = await fetch(`/trenes/${this.idTren}`);
      if (!response.ok) throw new Error('Error al obtener los datos del tren');
      
      const tren = await response.json();
      this.render(tren);
    } catch (error) {
      console.error(error);
      if (this.elNombre) this.elNombre.textContent = 'Error al cargar el tren';
      if (this.elDesc) this.elDesc.textContent = 'No se pudo obtener la información desde la base de datos.';
    }
  }

  render(tren) {
    if (this.elNombre) {
      this.elNombre.textContent = tren.serie ? `SERIE ${tren.serie}` : (tren.nombre || 'Tren sin nombre');
    }
    
    if (this.elImg) {
      this.elImg.src = tren.imagen_modelo || tren.imagen || tren.logo || '/img/cargando/03-42-05-37_512.gif';
      this.elImg.alt = `Fotografía de ${tren.serie || 'Tren'}`;
    }

    if (this.elDesc) {
      this.elDesc.textContent = tren.descripcionVisual || tren.descripcion || 'Sin descripción disponible.';
    }
  }

  // --- MÉTODOS DE CAPTURA ---

  async comprobarEstadoCaptura() {
    if (!this.btnCapturar || !this.idTren) return;
    try {
      const res = await fetch(`/api/capturas/estado/${this.idTren}`);
      const data = await res.json();
      if (data.capturado) {
        this.actualizarBotonCaptura(true);
      }
    } catch (err) {
      console.error('Error al comprobar estado de la captura:', err);
    }
  }

  escucharEventoCaptura() {
    if (!this.btnCapturar || !this.idTren) return;

    this.btnCapturar.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/capturas/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trenId: this.idTren })
        });
        const data = await res.json();

        if (data.ok) {
          this.actualizarBotonCaptura(data.capturado);
        } else {
          alert(data.message || 'Error al procesar la captura');
        }
      } catch (err) {
        console.error('Error al cambiar la captura:', err);
      }
    });
  }

  actualizarBotonCaptura(capturado) {
    if (capturado) {
      this.btnCapturar.textContent = '📸 ¡Capturado!';
      this.btnCapturar.classList.add('btn-capturado');
    } else {
      this.btnCapturar.textContent = '➕ Añadir a mis Capturas';
      this.btnCapturar.classList.remove('btn-capturado');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const vistaDetalle = new DetalleTren();
  vistaDetalle.init();
});