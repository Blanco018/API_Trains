document.addEventListener('DOMContentLoaded', () => {
  const formRegister = document.getElementById('formRegister');
  const modalSuccess = document.getElementById('modalSuccess');
  const btnModalYes = document.getElementById('btnModalYes');
  const btnModalNo = document.getElementById('btnModalNo');

  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('usernameRegister').value;
      const password = document.getElementById('passwordRegister').value;

      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernameRegister: username, passwordRegister: password })
        });

        const data = await response.json();

        if (response.ok) {
          const autoLogin = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameLogIn: username, passwordLogIn: password })
          });

          if (autoLogin.ok) {
            formRegister.reset();
            modalSuccess.classList.remove('hidden');
          }
        } else {
          alert(data.message || 'Error al registrar usuario');
        }
      } catch (err) {
        console.error('Error durante el registro:', err);
      }
    });
  }

  // Eventos de interacción con el Modal
  if (btnModalYes) {
    btnModalYes.addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  if (btnModalNo) {
    btnModalNo.addEventListener('click', () => {
      modalSuccess.classList.add('hidden');
    });
  }
});