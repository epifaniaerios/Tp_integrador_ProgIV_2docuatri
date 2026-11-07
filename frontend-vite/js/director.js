import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE = 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');
const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');

// Si no hay token o no es Director (Rol 3), redirige al registro común
if (!token || usuarioSesion.rol !== 3) {
    window.location.href = 'dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('user-info').textContent = `${usuarioSesion.nombre || 'Usuario'} (Director de Sistemas)`;
    document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
    document.getElementById('btn-descargar-pdf').addEventListener('click', descargarPDF);

    cargarDashboard();
});

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

const escapeHtml = (texto) =>
    String(texto ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

// Obtener datos del Dashboard
async function cargarDashboard() {
    try {
    const res = await fetch(`${API_BASE}/reportes/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
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
    document.getElementById('total-incidencias').textContent = data.total || 0;

    // Renderizar la lista de Estados
    const listaEstados = document.getElementById('lista-estados');
    if (data.porEstado && data.porEstado.length > 0) {
    listaEstados.innerHTML = data.porEstado.map(e => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
        ${escapeHtml(e.estado)}
        <span class="badge bg-primary rounded-pill">${e.total}</span>
        </li>
    `).join('');
    } else {
    listaEstados.innerHTML = '<li class="list-group-item text-muted">Sin datos.</li>';
    }

    // Renderizar la tabla de Prioritarias
    const tbody = document.getElementById('tabla-prioritarias');
    if (data.prioritarias && data.prioritarias.length > 0) {
    tbody.innerHTML = data.prioritarias.map(p => `
        <tr>
            <td><strong>#${p.id_incidencia}</strong></td>
            <td>${escapeHtml(p.articulo)}</td>
            <td><span class="badge bg-danger">${escapeHtml(p.estado)}</span></td>
            <td><small class="text-muted">${escapeHtml(p.creado)}</small></td>
        </tr>
    `).join('');
    } else {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">No hay incidencias prioritarias pendientes.</td></tr>';
    }
}

// Descargar PDF con Fetch + Blob
async function descargarPDF() {
    const btn = document.getElementById('btn-descargar-pdf');
    btn.disabled = true;
    btn.textContent = '⏳ Generando PDF...';

    try {
    const res = await fetch(`${API_BASE}/reportes/incidencias/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Error al generar el reporte PDF');

    // Convertir la respuesta HTTP a un objeto Blob 
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Crear un enlace temporal para forzar la descarga en el navegador
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-incidencias-${new Date().toISOString().slice(0,10)}.pdf`;
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
