import PDFDocument from 'pdfkit';
import * as reporteRepository from '../repositories/reporteRepository.js';
import { ESTADOS } from '../config/constantes.js';

const MARGEN = 50;
const ALTO_FILA = 20;
const COLORES = {
  primario: '#3f0c0c',
  texto: '#212529',
  suave: '#6c757d',
  encabezado: '#e9ecef',
  zebra: '#f8f9fa',
  borde: '#dee2e6',
};

export const obtenerDashboard = async () => {
  const [porEstado, porFecha, prioritarias] = await Promise.all([
    reporteRepository.totalesPorEstado(),
    reporteRepository.totalesPorFecha(),
    reporteRepository.prioritarias(),
  ]);
  const total = porEstado.reduce((acc, e) => acc + e.total, 0);
  return { total, porEstado, porFecha, prioritarias };
};

// ---------- Helpers de dibujo ----------

const porcentaje = (valor, total) => (total ? `${Math.round((valor / total) * 100)}%` : '0%');

const formatearFecha = (fechaIso) => fechaIso.split('-').reverse().join('/');

// Si no queda lugar en la hoja, pasa a una nueva
const asegurarEspacio = (doc, alto) => {
  if (doc.y + alto > doc.page.height - MARGEN - 20) doc.addPage();
};

const encabezado = (doc) => {
  doc.rect(0, 0, doc.page.width, 85).fill(COLORES.primario);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20)
    .text('Reporte estadístico de incidencias', MARGEN, 22, { lineBreak: false });
  doc.font('Helvetica').fontSize(10)
    .text('Municipalidad - Sistema de registro de incidencias', MARGEN, 50, { lineBreak: false });

  const fecha = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hourCycle: 'h23',
  });
  doc.text(`Generado el ${fecha}`, MARGEN, 64, { lineBreak: false });
  doc.y = 85 + 20;
};

const tarjetas = (doc, items) => {
  const ancho = 155;
  const separacion = 15;
  const alto = 56;
  const y = doc.y;

  items.forEach((item, i) => {
    const x = MARGEN + i * (ancho + separacion);
    doc.roundedRect(x, y, ancho, alto, 6).fillAndStroke(COLORES.zebra, COLORES.borde);
    doc.fillColor(COLORES.suave).font('Helvetica').fontSize(9)
      .text(item.etiqueta, x + 12, y + 10, { width: ancho - 24, lineBreak: false });
    doc.fillColor(COLORES.primario).font('Helvetica-Bold').fontSize(22)
      .text(String(item.valor), x + 12, y + 25, { width: ancho - 24, lineBreak: false });
  });
  doc.y = y + alto;
};

const tituloSeccion = (doc, texto) => {
  asegurarEspacio(doc, 80);
  const y = doc.y + 18;
  doc.fillColor(COLORES.primario).font('Helvetica-Bold').fontSize(12)
    .text(texto, MARGEN, y, { lineBreak: false });
  doc.y = y + 22;
};

// columnas: [{ titulo, ancho, alinear? }]  filas: [[celda, celda, ...]]
const tabla = (doc, columnas, filas, mensajeVacio) => {
  const anchoTotal = columnas.reduce((acc, c) => acc + c.ancho, 0);

  const dibujarEncabezado = () => {
    const y = doc.y;
    doc.rect(MARGEN, y, anchoTotal, ALTO_FILA).fill(COLORES.encabezado);
    let x = MARGEN;
    doc.fillColor(COLORES.texto).font('Helvetica-Bold').fontSize(10);
    columnas.forEach((c) => {
      doc.text(c.titulo, x + 6, y + 6, { width: c.ancho - 12, align: c.alinear || 'left', lineBreak: false });
      x += c.ancho;
    });
    doc.y = y + ALTO_FILA;
  };

  asegurarEspacio(doc, ALTO_FILA * 3);
  dibujarEncabezado();

  if (filas.length === 0) {
    const y = doc.y;
    doc.fillColor(COLORES.suave).font('Helvetica-Oblique').fontSize(10)
      .text(mensajeVacio, MARGEN + 6, y + 6, { lineBreak: false });
    doc.y = y + ALTO_FILA;
    return;
  }

  filas.forEach((fila, i) => {
    if (doc.y + ALTO_FILA > doc.page.height - MARGEN - 20) {
      doc.addPage();
      dibujarEncabezado();
    }
    const y = doc.y;
    if (i % 2 === 1) doc.rect(MARGEN, y, anchoTotal, ALTO_FILA).fill(COLORES.zebra);
    doc.moveTo(MARGEN, y + ALTO_FILA).lineTo(MARGEN + anchoTotal, y + ALTO_FILA)
      .lineWidth(0.5).strokeColor(COLORES.borde).stroke();

    let x = MARGEN;
    doc.fillColor(COLORES.texto).font('Helvetica').fontSize(10);
    columnas.forEach((c, j) => {
      doc.text(String(fila[j] ?? ''), x + 6, y + 6, {
        width: c.ancho - 12,
        height: 12,
        ellipsis: true,
        align: c.alinear || 'left',
      });
      x += c.ancho;
    });
    doc.y = y + ALTO_FILA;
  });
};

// Se escribe al final, cuando ya se sabe cuántas páginas hay
const pieDePagina = (doc) => {
  const rango = doc.bufferedPageRange();
  for (let i = 0; i < rango.count; i++) {
    doc.switchToPage(rango.start + i);
    doc.page.margins.bottom = 0;
    doc.fillColor(COLORES.suave).font('Helvetica').fontSize(9)
      .text(`Página ${i + 1} de ${rango.count}`, MARGEN, doc.page.height - 35, {
        width: doc.page.width - MARGEN * 2,
        align: 'center',
        lineBreak: false,
      });
  }
};

// ---------- Reporte ----------

// Primero se consultan los datos y recién después se empieza a escribir el PDF,
// así un error de base de datos todavía se puede responder como JSON.
export const generarPdf = async (res) => {
  const [porEstado, porFecha, porPrioridad, prioritarias] = await Promise.all([
    reporteRepository.totalesPorEstado(),
    reporteRepository.totalesPorFecha(),
    reporteRepository.totalesPorPrioridad(),
    reporteRepository.prioritarias(),
  ]);

  const total = porEstado.reduce((acc, e) => acc + e.total, 0);
  const sinResolver = porEstado
    .filter((e) => [ESTADOS.PENDIENTE, ESTADOS.EN_PROCESO].includes(e.id_estado))
    .reduce((acc, e) => acc + e.total, 0);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="reporte-incidencias.pdf"');

  const doc = new PDFDocument({ size: 'A4', margin: MARGEN, bufferPages: true });
  doc.pipe(res);

  encabezado(doc);

  tarjetas(doc, [
    { etiqueta: 'Total de incidencias', valor: total },
    { etiqueta: 'Sin resolver', valor: sinResolver },
    { etiqueta: 'Prioritarias (alta)', valor: prioritarias.length },
  ]);

  tituloSeccion(doc, 'Incidencias por estado');
  tabla(
    doc,
    [
      { titulo: 'Estado', ancho: 295 },
      { titulo: 'Cantidad', ancho: 100, alinear: 'right' },
      { titulo: 'Porcentaje', ancho: 100, alinear: 'right' },
    ],
    porEstado.map((e) => [e.estado, e.total, porcentaje(e.total, total)])
  );

  tituloSeccion(doc, 'Incidencias por prioridad');
  tabla(
    doc,
    [
      { titulo: 'Prioridad', ancho: 295 },
      { titulo: 'Cantidad', ancho: 100, alinear: 'right' },
      { titulo: 'Porcentaje', ancho: 100, alinear: 'right' },
    ],
    porPrioridad.map((p) => [p.prioridad, p.total, porcentaje(p.total, total)]),
    'No hay incidencias registradas'
  );

  tituloSeccion(doc, 'Incidencias por fecha de creación');
  tabla(
    doc,
    [
      { titulo: 'Fecha', ancho: 395 },
      { titulo: 'Cantidad', ancho: 100, alinear: 'right' },
    ],
    porFecha.map((f) => [formatearFecha(f.fecha), f.total]),
    'No hay incidencias registradas'
  );

  tituloSeccion(doc, 'Incidencias prioritarias (alta, sin resolver)');
  tabla(
    doc,
    [
      { titulo: '#', ancho: 50 },
      { titulo: 'Artículo', ancho: 175 },
      { titulo: 'Estado', ancho: 100 },
      { titulo: 'Creada', ancho: 170 },
    ],
    prioritarias.map((i) => [`#${i.id_incidencia}`, i.articulo, i.estado, i.creado]),
    'No hay incidencias prioritarias pendientes'
  );

  pieDePagina(doc);
  doc.end();
};