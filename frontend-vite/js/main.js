import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
const API_BASE = 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');
const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');

// 1. Control de Autenticación
if (!token) {
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const nombresRol = { 1: 'Empleado municipal', 2: 'Empleado de Sistemas', 3: 'Director de Sistemas' };
  document.getElementById('user-info').textContent =
    `${usuarioSesion.nombre || 'Usuario'} (${nombresRol[usuarioSesion.rol] || 'Sin rol'})`;

  document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
  document.getElementById('form-nueva-incidencia').addEventListener('submit', crearIncidencia);

  // Solo el empleado municipal crea incidencias
  if (usuarioSesion.rol === 1) {
    document.getElementById('btn-nueva-incidencia').classList.remove('d-none');
    cargarArticulos();
  }

  // Solo el empleado de Sistemas gestiona categorías y artículos
  if (usuarioSesion.rol === 2) {
    document.getElementById('link-gestion').classList.remove('d-none');
  }

  cargarIncidencias();
});

// Cerrar Sesión
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}


// BREAD DE CATEGORÍAS 
// 1. BROWSE / READ ALL: Obtener Categorías para el Selector del Modal
async function cargarCategorias() {
  try {
    const res = await fetch(`${API_BASE}/categorias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      const select = document.getElementById('id_categoria');
      select.innerHTML = '<option value="">Seleccione una categoría</option>';
      data.data.forEach(cat => {
        select.innerHTML += `<option value="${cat.id_categoria}">${cat.descripcion}</option>`;
      });
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// 2. READ ONE: Obtener una categoría específica
async function obtenerCategoriaPorId(id) {
  try {
    const res = await fetch(`${API_BASE}/categorias/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    return res.ok && data.status === 'OK' ? data.data : null;
  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    return null;
  }
}

// 3. ADD: Crear Nueva Categoría
async function crearCategoria(descripcion) {
  try {
    const res = await fetch(`${API_BASE}/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ descripcion })
    });
    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      console.log('Categoría creada con éxito');
      cargarCategorias(); // Recargar el select
    } else {
      alert(data.message || 'Error al crear la categoría');
    }
  } catch (error) {
    console.error('Error al crear categoría', error);
  }
}

// 4. EDIT: Actualizar una Categoría
async function editarCategoria(id, nuevaDescripcion) {
  try {
    const res = await fetch(`${API_BASE}/categorias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ descripcion: nuevaDescripcion })
    });
    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      console.log('Categoría actualizada con éxito');
      cargarCategorias(); // Recargar el select
    } else {
      alert(data.message || 'Error al actualizar la categoría');
    }
  } catch (error) {
    console.error('Error al editar categoría', error);
  }
}

// 5. DELETE: Borrado Lógico de Categoría
async function eliminarCategoria(id) {
  if (!confirm(`¿Confirma eliminar la categoría #${id}?`)) return;
  try {
    const res = await fetch(`${API_BASE}/categorias/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      console.log('Categoría eliminada (Soft Delete)');
      cargarCategorias(); // Recargar el select
    } else {
      alert(data.message || 'No se pudo eliminar la categoría');
    }
  } catch (error) {
    console.error('Error al eliminar categoría', error);
  }
}


// GESTIÓN DE INCIDENCIAS

const ROL = { MUNICIPAL: 1, SISTEMAS: 2, DIRECTOR: 3 };
const ESTADO = { PENDIENTE: 1, EN_PROCESO: 2, RESUELTA: 3, CANCELADA: 4 };

// Evita que un texto escrito por un usuario se interprete como HTML
const escapeHtml = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// Carga los artículos en el selector del modal "Nueva Incidencia"
async function cargarArticulos() {
  try {
    const res = await fetch(`${API_BASE}/articulos`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      // Por ahora el modal reutiliza el select con id "id_categoria"
      const select = document.getElementById('id_categoria');
      select.innerHTML = '<option value="">Seleccione un artículo</option>';
      data.data.forEach((art) => {
        select.innerHTML += `<option value="${art.id_articulo}">${escapeHtml(art.descripcion)} (${escapeHtml(art.categoria)})</option>`;
      });
    }
  } catch (error) {
    console.error('Error al cargar artículos:', error);
  }
}

// Botones que corresponden según el rol del usuario y el estado de la incidencia
function botonesAccion(inc) {
  const botones = [];
  const rol = usuarioSesion.rol;

  const puedeCancelar =
    inc.id_estado === ESTADO.PENDIENTE &&
    (rol === ROL.DIRECTOR || (rol === ROL.MUNICIPAL && inc.creado_por === usuarioSesion.id));
  if (puedeCancelar) {
    botones.push(`<button class="btn btn-outline-danger btn-sm" data-accion="cancelar" data-id="${inc.id_incidencia}">Cancelar</button>`);
  }

  const puedeAsignar =
    rol === ROL.DIRECTOR && [ESTADO.PENDIENTE, ESTADO.EN_PROCESO].includes(inc.id_estado);
  if (puedeAsignar) {
    botones.push(`<button class="btn btn-outline-primary btn-sm" data-accion="asignar" data-id="${inc.id_incidencia}">Asignar</button>`);
  }

  const puedeFinalizar = rol === ROL.SISTEMAS && inc.id_estado === ESTADO.EN_PROCESO;
  if (puedeFinalizar) {
    botones.push(`<button class="btn btn-outline-success btn-sm" data-accion="finalizar" data-id="${inc.id_incidencia}">Finalizar</button>`);
  }

  return botones.length ? botones.join(' ') : '<span class="text-muted small">Sin acciones</span>';
}

// Obtener y Renderizar Incidencias
async function cargarIncidencias() {
  const tbody = document.getElementById('tabla-incidencias');

  try {
    const res = await fetch(`${API_BASE}/incidencias`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      cerrarSesion();
      return;
    }

    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      if (data.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No hay incidencias registradas.</td></tr>';
        return;
      }

      tbody.innerHTML = data.data.map((inc) => `
        <tr>
          <td><strong>#${inc.id_incidencia}</strong></td>
          <td>
            <strong>${escapeHtml(inc.articulo)}</strong><br>
            <small class="text-muted">${escapeHtml(inc.descripcion_pedido)}</small>
            ${inc.descripcion_resolucion ? `<br><small class="text-success">Resolución: ${escapeHtml(inc.descripcion_resolucion)}</small>` : ''}
          </td>
          <td><span class="badge bg-secondary">${escapeHtml(inc.categoria)}</span></td>
          <td>${badgePrioridad(inc.prioridad)}</td>
          <td>${badgeEstado(inc.id_estado, inc.estado)}</td>
          <td>
            <small class="text-muted">
              ${escapeHtml(inc.creado_por_nombre)}
              ${inc.asignado_a_nombre ? `<br>Asignada a: ${escapeHtml(inc.asignado_a_nombre)}` : ''}
            </small>
          </td>
          <td class="text-end">${botonesAccion(inc)}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-4">Error al conectar con la API.</td></tr>';
  }
}

// Registrar Nueva Incidencia
async function crearIncidencia(e) {
  e.preventDefault();

  const titulo = document.getElementById('titulo').value.trim();
  const detalle = document.getElementById('descripcion').value.trim();
  const prioridades = { ALTA: 1, MEDIA: 2, BAJA: 3 };
  const valorPrioridad = document.getElementById('prioridad').value;

  const nueva = {
    id_articulo: parseInt(document.getElementById('id_categoria').value),
    descripcion_pedido: [titulo, detalle].filter(Boolean).join(' - ').slice(0, 250),
    prioridad: prioridades[valorPrioridad] || Number(valorPrioridad) || 2,
  };

  try {
    const res = await fetch(`${API_BASE}/incidencias`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(nueva),
    });

    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      const modalEl = document.getElementById('modalIncidencia');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();

      document.getElementById('form-nueva-incidencia').reset();
      cargarIncidencias();
    } else {
      const detalleErrores = data.errores ? data.errores.map((er) => er.mensaje).join('\n') : '';
      alert(detalleErrores || data.message || 'Error al guardar la incidencia');
    }
  } catch (error) {
    alert('Error al intentar registrar la incidencia');
  }
}

// Llama a PATCH /incidencias/:id/<accion> y recarga la tabla
async function accionIncidencia(id, accion, body) {
  try {
    const res = await fetch(`${API_BASE}/incidencias/${id}/${accion}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      cargarIncidencias();
    } else {
      const detalleErrores = data.errores ? data.errores.map((er) => er.mensaje).join('\n') : '';
      alert(detalleErrores || data.message || 'No se pudo realizar la acción');
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}

function cancelarIncidencia(id) {
  if (!confirm(`¿Confirma cancelar la incidencia #${id}?`)) return;
  accionIncidencia(id, 'cancelar');
}

function finalizarIncidencia(id) {
  const resolucion = prompt('Describí cómo se resolvió la incidencia:');
  if (!resolucion || !resolucion.trim()) return;
  accionIncidencia(id, 'finalizar', { descripcion_resolucion: resolucion.trim() });
}

async function asignarIncidencia(id) {
  try {
    const res = await fetch(`${API_BASE}/usuarios/sistemas`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();

    if (!res.ok || data.status !== 'OK' || data.data.length === 0) {
      alert(data.message || 'No hay empleados de Sistemas disponibles');
      return;
    }

    const lista = data.data.map((u) => `${u.id_usuario} - ${u.nombres} ${u.apellidos}`).join('\n');
    const elegido = prompt(`Escribí el número del empleado a asignar:\n\n${lista}`);
    if (!elegido) return;

    accionIncidencia(id, 'asignar', { asignado_a: Number(elegido) });
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}

// Un solo "oyente" para todos los botones de la tabla (usan data-accion y data-id)
document.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;

  const { accion, id } = boton.dataset;
  if (accion === 'cancelar') cancelarIncidencia(id);
  if (accion === 'asignar') asignarIncidencia(id);
  if (accion === 'finalizar') finalizarIncidencia(id);
});

// Helpers para etiquetas visuales
function badgePrioridad(prioridad) {
  const niveles = {
    1: { texto: 'ALTA', clase: 'bg-danger' },
    2: { texto: 'MEDIA', clase: 'bg-warning text-dark' },
    3: { texto: 'BAJA', clase: 'bg-info text-dark' },
  };
  const nivel = niveles[prioridad] || { texto: prioridad, clase: 'bg-secondary' };
  return `<span class="badge ${nivel.clase}">${nivel.texto}</span>`;
}

function badgeEstado(id_estado, texto) {
  const clases = {
    [ESTADO.PENDIENTE]: 'bg-secondary',
    [ESTADO.EN_PROCESO]: 'bg-primary',
    [ESTADO.RESUELTA]: 'bg-success',
    [ESTADO.CANCELADA]: 'bg-dark',
  };
  return `<span class="badge ${clases[id_estado] || 'bg-light text-dark'}">${escapeHtml(texto)}</span>`;
}