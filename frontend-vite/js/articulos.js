import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';


const API_BASE = 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');
const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');

if (!token) {
  window.location.href = 'index.html';
}

const escapeHtml = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

async function cargarArticulos() {
  const tbody = document.getElementById('tabla-articulos');

  try {
    const res = await fetch(`${API_BASE}/articulos`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      cerrarSesion();
      return;
    }

    const data = await res.json();

    if (!res.ok || data.status !== 'OK') {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">No se pudieron cargar los artículos.</td></tr>';
      return;
    }

    if (data.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No hay artículos registrados.</td></tr>';
      return;
    }

    tbody.innerHTML = data.data.map((a) => `
      <tr>
        <td><strong>#${a.id_articulo}</strong></td>
        <td>${escapeHtml(a.descripcion)}</td>
        <td>${escapeHtml(a.area)}</td>
        <td><span class="badge bg-secondary">${escapeHtml(a.categoria)}</span></td>
      </tr>`).join('');
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Error al conectar con la API.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const nombresRol = { 1: 'Empleado municipal', 2: 'Empleado de Sistemas', 3: 'Director de Sistemas' };
  document.getElementById('user-info').textContent =
    `${usuarioSesion.nombre || 'Usuario'} (${nombresRol[usuarioSesion.rol] || 'Sin rol'})`;
  document.getElementById('btn-logout').addEventListener('click', cerrarSesion);

  cargarArticulos();
});