import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';

const API_BASE = 'http://localhost:3000/api/v1';
const token = localStorage.getItem('token');
const usuarioSesion = JSON.parse(localStorage.getItem('usuario') || '{}');

let categorias = [];
let articulos = [];
let areas = [];
let modalCategoria;
let modalArticulo;

// Solo el empleado de Sistemas (rol 2) entra a esta pantalla
if (!token) {
  window.location.href = 'index.html';
} else if (usuarioSesion.rol !== 2) {
  window.location.href = 'dashboard.html';
} else {
  iniciar();
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}

// Evita que un texto escrito por un usuario se interprete como HTML
const escapeHtml = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

// Llamada a la API: devuelve los datos o lanza un Error con el mensaje a mostrar
async function api(ruta, metodo = 'GET', body) {
  const res = await fetch(`${API_BASE}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();

  if (res.status === 401 || (res.status === 403 && /token/i.test(data.message || ''))) {
    cerrarSesion();
    throw new Error('La sesión venció');
  }
  if (!res.ok || data.status !== 'OK') {
    const detalle = data.errores ? data.errores.map((e) => e.msg || e.mensaje).join('. ') : '';
    throw new Error(detalle || data.message || 'No se pudo completar la operación');
  }
  return data.data;
}

function mostrarMensaje(texto, tipo) {
  document.getElementById('alert-container').innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${escapeHtml(texto)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function llenarSelect(idSelect, lista, campoId, seleccionado) {
  const select = document.getElementById(idSelect);
  select.innerHTML =
    '<option value="">Seleccione...</option>' +
    lista
      .map((item) =>
        `<option value="${item[campoId]}" ${item[campoId] === seleccionado ? 'selected' : ''}>${escapeHtml(item.descripcion)}</option>`
      )
      .join('');
}

async function cargarTodo() {
  try {
    [categorias, areas, articulos] = await Promise.all([
      api('/categorias'),
      api('/areas'),
      api('/articulos'),
    ]);
    renderCategorias();
    renderArticulos();
  } catch (error) {
    mostrarMensaje(error.message, 'danger');
  }
}

// ---------- Categorías ----------

function renderCategorias() {
  const tbody = document.getElementById('tabla-categorias');
  if (categorias.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted">No hay categorías.</td></tr>';
    return;
  }
  tbody.innerHTML = categorias.map((c) => `
    <tr>
      <td><strong>#${c.id_categoria}</strong></td>
      <td>${escapeHtml(c.descripcion)}</td>
      <td class="text-end">
        <button class="btn btn-outline-primary btn-sm" data-accion="editar" data-id="${c.id_categoria}">Editar</button>
        <button class="btn btn-outline-danger btn-sm" data-accion="eliminar" data-id="${c.id_categoria}">Eliminar</button>
      </td>
    </tr>`).join('');
}

function abrirCategoria(cat) {
  document.getElementById('titulo-modal-categoria').textContent = cat ? 'Editar categoría' : 'Nueva categoría';
  document.getElementById('categoria-id').value = cat ? cat.id_categoria : '';
  document.getElementById('categoria-descripcion').value = cat ? cat.descripcion : '';
  document.getElementById('error-categoria').textContent = '';
  modalCategoria.show();
}

async function guardarCategoria(e) {
  e.preventDefault();
  const id = document.getElementById('categoria-id').value;
  const descripcion = document.getElementById('categoria-descripcion').value.trim();

  try {
    if (id) await api(`/categorias/${id}`, 'PUT', { descripcion });
    else await api('/categorias', 'POST', { descripcion });

    modalCategoria.hide();
    mostrarMensaje(id ? 'Categoría actualizada' : 'Categoría creada', 'success');
    await cargarTodo();
  } catch (error) {
    document.getElementById('error-categoria').textContent = error.message;
  }
}

async function eliminarCategoria(id) {
  if (!confirm('¿Confirma eliminar esta categoría?')) return;
  try {
    await api(`/categorias/${id}`, 'DELETE');
    mostrarMensaje('Categoría eliminada', 'success');
    await cargarTodo();
  } catch (error) {
    mostrarMensaje(error.message, 'danger');
  }
}

// ---------- Artículos ----------

function renderArticulos() {
  const tbody = document.getElementById('tabla-articulos');
  if (articulos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No hay artículos.</td></tr>';
    return;
  }
  tbody.innerHTML = articulos.map((a) => `
    <tr>
      <td><strong>#${a.id_articulo}</strong></td>
      <td>${escapeHtml(a.descripcion)}</td>
      <td>${escapeHtml(a.area)}</td>
      <td><span class="badge bg-secondary">${escapeHtml(a.categoria)}</span></td>
      <td class="text-end">
        <button class="btn btn-outline-primary btn-sm" data-accion="editar" data-id="${a.id_articulo}">Editar</button>
        <button class="btn btn-outline-danger btn-sm" data-accion="eliminar" data-id="${a.id_articulo}">Eliminar</button>
      </td>
    </tr>`).join('');
}

function abrirArticulo(art) {
  document.getElementById('titulo-modal-articulo').textContent = art ? 'Editar artículo' : 'Nuevo artículo';
  document.getElementById('articulo-id').value = art ? art.id_articulo : '';
  document.getElementById('articulo-descripcion').value = art ? art.descripcion : '';
  llenarSelect('articulo-area', areas, 'id_area', art?.id_area);
  llenarSelect('articulo-categoria', categorias, 'id_categoria', art?.id_categoria);
  document.getElementById('error-articulo').textContent = '';
  modalArticulo.show();
}

async function guardarArticulo(e) {
  e.preventDefault();
  const id = document.getElementById('articulo-id').value;
  const cuerpo = {
    descripcion: document.getElementById('articulo-descripcion').value.trim(),
    id_area: Number(document.getElementById('articulo-area').value),
    id_categoria: Number(document.getElementById('articulo-categoria').value),
  };

  try {
    if (id) await api(`/articulos/${id}`, 'PUT', cuerpo);
    else await api('/articulos', 'POST', cuerpo);

    modalArticulo.hide();
    mostrarMensaje(id ? 'Artículo actualizado' : 'Artículo creado', 'success');
    await cargarTodo();
  } catch (error) {
    document.getElementById('error-articulo').textContent = error.message;
  }
}

async function eliminarArticulo(id) {
  if (!confirm('¿Confirma eliminar este artículo?')) return;
  try {
    await api(`/articulos/${id}`, 'DELETE');
    mostrarMensaje('Artículo eliminado', 'success');
    await cargarTodo();
  } catch (error) {
    mostrarMensaje(error.message, 'danger');
  }
}

// ---------- Inicio ----------

function iniciar() {
  document.getElementById('user-info').textContent = `${usuarioSesion.nombre || 'Usuario'} (Empleado de Sistemas)`;
  document.getElementById('btn-logout').addEventListener('click', cerrarSesion);

  modalCategoria = new bootstrap.Modal(document.getElementById('modalCategoria'));
  modalArticulo = new bootstrap.Modal(document.getElementById('modalArticulo'));

  document.getElementById('btn-nueva-categoria').addEventListener('click', () => abrirCategoria());
  document.getElementById('btn-nuevo-articulo').addEventListener('click', () => abrirArticulo());
  document.getElementById('form-categoria').addEventListener('submit', guardarCategoria);
  document.getElementById('form-articulo').addEventListener('submit', guardarArticulo);

  document.getElementById('tabla-categorias').addEventListener('click', (e) => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === 'editar') abrirCategoria(categorias.find((c) => c.id_categoria === id));
    if (boton.dataset.accion === 'eliminar') eliminarCategoria(id);
  });

  document.getElementById('tabla-articulos').addEventListener('click', (e) => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    if (boton.dataset.accion === 'editar') abrirArticulo(articulos.find((a) => a.id_articulo === id));
    if (boton.dataset.accion === 'eliminar') eliminarArticulo(id);
  });

  cargarTodo();
}