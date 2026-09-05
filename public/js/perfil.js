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
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });

  // 2. Cargar datos del usuario logueado
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const user = await res.json();
      const username = user.username || 'Usuario';

      // Título central en MAYÚSCULAS
      document.getElementById('header-user-title').textContent = username.toUpperCase();
    } else {
      window.location.href = '/login';
    }
  } catch (err) {
    console.error('Error al cargar datos del usuario:', err);
  }
});