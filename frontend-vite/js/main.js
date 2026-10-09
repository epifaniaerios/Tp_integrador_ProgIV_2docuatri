const API_BASE = 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');
const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');

// 1. Control de Autenticación
if (!token) {
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // Mostrar datos del usuario en navbar
  document.getElementById('user-info').textContent = `${usuarioSesion.nombre || 'Usuario'} (${usuarioSesion.rol || 'ROL'})`;

  // Inicializar listeners y carga de datos
  document.getElementById('btn-logout').addEventListener('click', cerrarSesion);
  document.getElementById('form-nueva-incidencia').addEventListener('submit', crearIncidencia);

  cargarCategorias();
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

// Obtener y Renderizar Incidencias
async function cargarIncidencias() {
  const tbody = document.getElementById('tabla-incidencias');
  
  try {
    const res = await fetch(`${API_BASE}/incidencias`, {
      headers: { 'Authorization': `Bearer ${token}` }
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

      tbody.innerHTML = data.data.map(inc => `
        <tr>
          <td><strong>#${inc.id_incidencia}</strong></td>
          <td>${inc.titulo}</td>
          <td><span class="badge bg-secondary">${inc.categoria}</span></td>
          <td>${badgePrioridad(inc.prioridad)}</td>
          <td>${badgeEstado(inc.estado)}</td>
          <td><small class="text-muted">${inc.creado_por}</small></td>
          <td class="text-end">
            ${usuarioSesion.rol === 'ADMIN' ? `
              <button class="btn btn-outline-danger btn-sm" onclick="eliminarIncidencia(${inc.id_incidencia})">Eliminar</button>
            ` : '<span class="text-muted small">Sin acciones</span>'}
          </td>
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

  const nueva = {
    titulo: document.getElementById('titulo').value,
    id_categoria: parseInt(document.getElementById('id_categoria').value),
    prioridad: document.getElementById('prioridad').value,
    descripcion: document.getElementById('descripcion').value,
    id_usuario: usuarioSesion.id
  };

  try {
    const res = await fetch(`${API_BASE}/incidencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(nueva)
    });

    const data = await res.json();

    if (res.ok && data.status === 'OK') {
      // Cerrar modal
      const modalEl = document.getElementById('modalIncidencia');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();

      // Resetear formulario y recargar tabla
      document.getElementById('form-nueva-incidencia').reset();
      cargarIncidencias();
    } else {
      alert(data.message || 'Error al guardar la incidencia');
    }
  } catch (error) {
    alert('Error al intentar registrar la incidencia');
  }
}

// Borrado Lógico (Soft Delete) de Incidencia
async function eliminarIncidencia(id) {
  if (!confirm(`¿Confirma eliminar la incidencia #${id}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/incidencias/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      cargarIncidencias();
    } else {
      alert('No se pudo eliminar la incidencia');
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}

// Helpers para etiquetas visuales
function badgePrioridad(prioridad) {
  const clases = {
    ALTA: 'bg-danger',
    MEDIA: 'bg-warning text-dark',
    BAJA: 'bg-info text-dark'
  };
  return `<span class="badge ${clases[prioridad] || 'bg-secondary'}">${prioridad}</span>`;
}

function badgeEstado(estado) {
  const clases = {
    PENDIENTE: 'bg-secondary',
    EN_PROCESO: 'bg-primary',
    RESUELTO: 'bg-success',
    CANCELADO: 'bg-dark'
  };
  return `<span class="badge ${clases[estado] || 'bg-light text-dark'}">${estado}</span>`;
}