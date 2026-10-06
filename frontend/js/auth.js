const API_URL = 'http://localhost:3000/api/v1/auth/login';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = document.getElementById('usuario').value;
  const contrasenia = document.getElementById('contrasenia').value;
  const alertContainer = document.getElementById('alert-container');

  alertContainer.innerHTML = ''; // Limpiar alertas previas

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario, contrasenia }),
    });

    const data = await response.json();

    if (response.ok && data.status === 'OK') {
      // Guardar sesión en localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario));

      // Redireccionar al panel
      window.location.href = 'dashboard.html';
    } else {
      // Manejar errores devueltos por express-validator o el controlador
      const mensajeError = data.errores 
        ? data.errores.map(err => err.msg).join('<br>') 
        : (data.message || 'Error al iniciar sesión');

      alertContainer.innerHTML = `
        <div class="alert alert-danger text-center py-2" role="alert">
          <small>${mensajeError}</small>
        </div>
      `;
    }
  } catch (error) {
    alertContainer.innerHTML = `
      <div class="alert alert-danger text-center py-2" role="alert">
        <small>No se pudo establecer conexión con el servidor backend.</small>
      </div>
    `;
  }
});