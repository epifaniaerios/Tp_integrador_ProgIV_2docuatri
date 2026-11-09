import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE = 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');
const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');

const ESTADO = { PENDIENTE: 1, EN_PROCESO: 2, RESUELTA: 3, CANCELADA: 4 };

const COLOR_ESTADO = {
  [ESTADO.PENDIENTE]: 'bg-secondary',
  [ESTADO.EN_PROCESO]: 'bg-primary',
  [ESTADO.RESUELTA]: 'bg-success',
  [ESTADO.CANCELADA]: 'bg-dark',
};

const escapeHtml = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

// De 2026-09-13 a 13/09/2026
const formatearFecha = (fecha) => String(fecha).split('-').reverse().join('/');

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

function iniciar() {
  document.getElementById('user-info').textContent =
    `${usuarioSesion.nombre || 'Usuario'} (Director de Sistemas)`;
  document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
  document.getElementById('btn-descargar-pdf').addEventListener('click', descargarPDF);

  cargarDashboard();
}

// Obtener datos del dashboard
async function cargarDashboard() {
  try {
    const res = await fetch(`${API_BASE}/reportes/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.status === 401) {
      cerrarSesion();
      return;
    }

    const data = await res.json();

    if (!res.ok || data.status !== 'OK') {
      throw new Error(data.message || 'No se pudo obtener el dashboard');
    }

    renderDashboard(data.data);
  } catch (error) {
    document.getElementById('alert-container').innerHTML = `
      <div class="alert alert-danger" role="alert">
        ${escapeHtml(error.message)}
      </div>`;
  }
}

function renderDashboard(data) {
  const porEstado = data.porEstado || [];
  const porFecha = data.porFecha || [];
  const prioritarias = data.prioritarias || [];

  // Métricas
  const sinResolver = porEstado
    .filter((e) => [ESTADO.PENDIENTE, ESTADO.EN_PROCESO].includes(e.id_estado))
    .reduce((acc, e) => acc + e.total, 0);

  document.getElementById('total-incidencias').textContent = data.total || 0;
  document.getElementById('sin-resolver').textContent = sinResolver;
  document.getElementById('total-prioritarias').textContent = prioritarias.length;

  // Totales por estado
  const listaEstados = document.getElementById('lista-estados');
  listaEstados.innerHTML = porEstado.length
    ? porEstado.map((e) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${escapeHtml(e.estado)}
          <span class="badge ${COLOR_ESTADO[e.id_estado] || 'bg-primary'} rounded-pill">${e.total}</span>
        </li>`).join('')
    : '<li class="list-group-item text-muted">Sin datos.</li>';

  // Totales por fecha
  const listaFechas = document.getElementById('lista-fechas');
  listaFechas.innerHTML = porFecha.length
    ? porFecha.map((f) => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${escapeHtml(formatearFecha(f.fecha))}
          <span class="badge bg-primary rounded-pill">${f.total}</span>
        </li>`).join('')
    : '<li class="list-group-item text-muted">Sin datos.</li>';

  // Incidencias prioritarias
  const tbody = document.getElementById('tabla-prioritarias');
  tbody.innerHTML = prioritarias.length
    ? prioritarias.map((p) => `
        <tr>
          <td><strong>#${p.id_incidencia}</strong></td>
          <td>${escapeHtml(p.articulo)}</td>
          <td><small class="text-muted">${escapeHtml(p.descripcion_pedido)}</small></td>
          <td><span class="badge bg-danger">${escapeHtml(p.estado)}</span></td>
          <td><small class="text-muted">${escapeHtml(p.creado)}</small></td>
        </tr>`).join('')
    : '<tr><td colspan="5" class="text-center text-muted py-3">No hay incidencias prioritarias pendientes.</td></tr>';
}

// Descargar el PDF con fetch + Blob (el token va en el header)
async function descargarPDF() {
  const btn = document.getElementById('btn-descargar-pdf');
  btn.disabled = true;
  btn.textContent = 'Generando PDF...';

  try {
    const res = await fetch(`${API_BASE}/reportes/incidencias/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.status === 401) {
      cerrarSesion();
      return;
    }
    if (!res.ok) throw new Error('Error al generar el reporte PDF');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-incidencias-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert(error.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Descargar Reporte PDF';
  }
}

// Solo el Director (rol 3) puede estar en esta pantalla
if (!token) {
  window.location.href = 'index.html';
} else if (usuarioSesion.rol !== 3) {
  window.location.href = 'dashboard.html';
} else {
  document.addEventListener('DOMContentLoaded', iniciar);
}