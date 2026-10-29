import PDFDocument from 'pdfkit';
import * as reporteRepository from '../repositories/reporteRepository.js';

export const obtenerDashboard = async () => {
  const [porEstado, porFecha, prioritarias] = await Promise.all([
    reporteRepository.totalesPorEstado(),
    reporteRepository.totalesPorFecha(),
    reporteRepository.prioritarias(),
  ]);
  const total = porEstado.reduce((acc, e) => acc + e.total, 0);
  return { total, porEstado, porFecha, prioritarias };
};

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

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="reporte-incidencias.pdf"');

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text('Reporte estadístico de incidencias', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Generado el ${new Date().toLocaleString('es-AR')}`, { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(14).text(`Total de incidencias: ${total}`);
  doc.moveDown();

  doc.fontSize(14).text('Por estado');
  doc.fontSize(12);
  porEstado.forEach((e) => doc.text(`   ${e.estado}: ${e.total}`));
  doc.moveDown();

  doc.fontSize(14).text('Por prioridad');
  doc.fontSize(12);
  porPrioridad.forEach((p) => doc.text(`   ${p.prioridad}: ${p.total}`));
  doc.moveDown();

  doc.fontSize(14).text('Por fecha de creación');
  doc.fontSize(12);
  if (porFecha.length === 0) doc.text('   Sin incidencias registradas');
  porFecha.forEach((f) => doc.text(`   ${f.fecha}: ${f.total}`));
  doc.moveDown();

  doc.fontSize(14).text('Incidencias prioritarias (alta, sin resolver)');
  doc.fontSize(12);
  if (prioritarias.length === 0) doc.text('   No hay incidencias prioritarias pendientes');
  prioritarias.forEach((i) =>
    doc.text(`   #${i.id_incidencia} - ${i.articulo} - ${i.estado} - ${i.creado}`)
  );

  doc.end();
};