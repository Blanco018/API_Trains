// public/js/detalle.js

class DetalleTren {
  constructor() {
    this.params = new URLSearchParams(window.location.search);
    this.idTren = this.params.get('id');
    
    // Referencias al DOM
    this.elNombre = document.getElementById('nombreTren');
    this.elImg = document.getElementById('imgTren');
    this.elDesc = document.getElementById('descTren');
    this.elUser = document.getElementById('userNombre');
  }

  async init() {
    if (!this.idTren) {
      console.warn('No se ha proporcionado un ID de tren.');
      return;
    }
    await this.cargarDetalles();
  }

  async cargarDetalles() {
    try {
      const response = await fetch(`/api/trenes/${this.idTren}`);
      if (!response.ok) throw new Error('Error al obtener los datos del tren');
      
      const tren = await response.json();
      this.render(tren);
    } catch (error) {
      console.error(error);
      if (this.elNombre) this.elNombre.textContent = 'Error al cargar el tren';
    }
  }

  render(tren) {
    if (this.elNombre) this.elNombre.textContent = tren.nombre || 'Tren no encontrado';
    if (this.elImg && tren.imagen) this.elImg.src = tren.imagen;
    if (this.elDesc) this.elDesc.textContent = tren.descripcion || 'Sin descripción disponible.';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const vistaDetalle = new DetalleTren();
  vistaDetalle.init();
});