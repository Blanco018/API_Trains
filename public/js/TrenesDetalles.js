class DetalleTren {
  constructor() {
    this.params = new URLSearchParams(window.location.search);
    this.idTren = this.params.get('id');
    
    // Referencias al DOM
    this.elNombre = document.getElementById('nombreTren');
    this.elImg = document.getElementById('imgTren');
    this.elDesc = document.getElementById('descTren');
    this.elUser = document.getElementById('username-display'); // Coincide con el id del HTML
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
  // Mapeo del título del tren
  if (this.elNombre) {
    this.elNombre.textContent = tren.serie ? `SERIE ${tren.serie}` : (tren.nombre || 'Tren sin nombre');
  }
  
  // 👈 ASIGNACIÓN DE LA IMAGEN DEL MODELO
  if (this.elImg) {
    // Prioriza imagen_modelo, luego cae en imagen/logo y por último en el placeholder por defecto
    this.elImg.src = tren.imagen_modelo || tren.imagen || tren.logo || '/img/cargando/03-42-05-37_512.gif';
    this.elImg.alt = `Fotografía de ${tren.serie || 'Tren'}`;
  }

  // Mapeo de la descripción
  if (this.elDesc) {
    this.elDesc.textContent = tren.descripcionVisual || tren.descripcion || 'Sin descripción disponible.';
  }
}
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  const vistaDetalle = new DetalleTren();
  vistaDetalle.init();
});