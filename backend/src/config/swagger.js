const seguro = [{ bearerAuth: [] }];

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
};

const textos = {
  200: 'OK',
  201: 'Creado correctamente',
  400: 'Error de validación o regla de negocio',
  401: 'Token no proporcionado',
  403: 'Sin permisos o token inválido',
  404: 'No encontrado',
};

const respuestas = (...codigos) =>
  Object.fromEntries(codigos.map((c) => [c, { description: textos[c] }]));

const cuerpo = (propiedades, requeridos) => ({
  required: true,
  content: {
    'application/json': {
      schema: { type: 'object', required: requeridos, properties: propiedades },
    },
  },
});

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API - Sistema de Registro de Incidencias Municipales',
    version: '1.0.0',
    description:
      'Trabajo Final Integrador - Programación IV. Roles: 1 = Empleado municipal, 2 = Empleado de Sistemas, 3 = Director de Sistemas. Prioridad: 1 = alta, 2 = media, 3 = baja.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  tags: [
    { name: 'Auth' },
    { name: 'Categorias' },
    { name: 'Articulos' },
    { name: 'Incidencias' },
    { name: 'Reportes' },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Inicia sesión y devuelve un token JWT',
        requestBody: cuerpo(
          {
            usuario: { type: 'string', example: 'estren@correo.com' },
            contrasenia: { type: 'string', example: 'Director123!' },
          },
          ['usuario', 'contrasenia']
        ),
        responses: respuestas(200, 400, 401),
      },
    },

    '/categorias': {
      get: {
        tags: ['Categorias'],
        summary: 'Lista las categorías activas',
        security: seguro,
        responses: respuestas(200, 401, 403),
      },
      post: {
        tags: ['Categorias'],
        summary: 'Crea una categoría (empleado de Sistemas)',
        security: seguro,
        requestBody: cuerpo({ descripcion: { type: 'string', example: 'Impresoras' } }, ['descripcion']),
        responses: respuestas(201, 400, 401, 403),
      },
    },
    '/categorias/{id}': {
      get: {
        tags: ['Categorias'],
        summary: 'Obtiene una categoría por id',
        security: seguro,
        parameters: [idParam],
        responses: respuestas(200, 400, 401, 404),
      },
      put: {
        tags: ['Categorias'],
        summary: 'Modifica una categoría (empleado de Sistemas)',
        security: seguro,
        parameters: [idParam],
        requestBody: cuerpo({ descripcion: { type: 'string', example: 'Impresoras 3D' } }, ['descripcion']),
        responses: respuestas(200, 400, 401, 403, 404),
      },
      delete: {
        tags: ['Categorias'],
        summary: 'Da de baja una categoría, borrado lógico (empleado de Sistemas)',
        security: seguro,
        parameters: [idParam],
        responses: respuestas(200, 400, 401, 403, 404),
      },
    },

    '/articulos': {
      get: {
        tags: ['Articulos'],
        summary: 'Lista los artículos activos',
        security: seguro,
        responses: respuestas(200, 401),
      },
      post: {
        tags: ['Articulos'],
        summary: 'Crea un artículo (empleado de Sistemas)',
        security: seguro,
        requestBody: cuerpo(
          {
            id_area: { type: 'integer', example: 1 },
            id_categoria: { type: 'integer', example: 1 },
            descripcion: { type: 'string', example: 'Teclado Logitech' },
          },
          ['id_area', 'id_categoria', 'descripcion']
        ),
        responses: respuestas(201, 400, 401, 403),
      },
    },
    '/articulos/{id}': {
      get: {
        tags: ['Articulos'],
        summary: 'Obtiene un artículo por id',
        security: seguro,
        parameters: [idParam],
        responses: respuestas(200, 400, 401, 404),
      },
      put: {
        tags: ['Articulos'],
        summary: 'Modifica un artículo (empleado de Sistemas)',
        security: seguro,
        parameters: [idParam],
        requestBody: cuerpo(
          {
            id_area: { type: 'integer', example: 1 },
            id_categoria: { type: 'integer', example: 1 },
            descripcion: { type: 'string', example: 'Teclado inalámbrico' },
          },
          ['id_area', 'id_categoria', 'descripcion']
        ),
        responses: respuestas(200, 400, 401, 403, 404),
      },
      delete: {
        tags: ['Articulos'],
        summary: 'Da de baja un artículo, borrado lógico (empleado de Sistemas)',
        security: seguro,
        parameters: [idParam],
        responses: respuestas(200, 400, 401, 403, 404),
      },
    },

    '/incidencias': {
      get: {
        tags: ['Incidencias'],
        summary: 'Lista incidencias según el rol (municipal: las propias, Sistemas: las asignadas, director: todas)',
        security: seguro,
        responses: respuestas(200, 401),
      },
      post: {
        tags: ['Incidencias'],
        summary: 'Crea una incidencia (empleado municipal)',
        security: seguro,
        requestBody: cuerpo(
          {
            id_articulo: { type: 'integer', example: 1 },
            descripcion_pedido: { type: 'string', example: 'No enciende' },
            prioridad: { type: 'integer', enum: [1, 2, 3], example: 2, description: '1 alta, 2 media, 3 baja' },
          },
          ['id_articulo', 'descripcion_pedido']
        ),
        responses: respuestas(201, 400, 401, 403, 404),
      },
    },
    '/incidencias/{id}': {
      get: {
        tags: ['Incidencias'],
        summary: 'Obtiene una incidencia visible para el usuario',
        security: seguro,
        parameters: [idParam],
        responses: respuestas(200, 400, 401, 403, 404),
      },
    },
    '/incidencias/{id}/cancelar': {
      patch: {
        tags: ['Incidencias'],
        summary: 'Cancela una incidencia pendiente (municipal: solo las propias; director: cualquiera)',
        security: seguro,
        parameters: [idParam],
        responses: respuestas(200, 400, 401, 403, 404),
      },
    },
    '/incidencias/{id}/asignar': {
      patch: {
        tags: ['Incidencias'],
        summary: 'Asigna la incidencia a un empleado de Sistemas (director)',
        security: seguro,
        parameters: [idParam],
        requestBody: cuerpo({ asignado_a: { type: 'integer', example: 1 } }, ['asignado_a']),
        responses: respuestas(200, 400, 401, 403, 404),
      },
    },
    '/incidencias/{id}/finalizar': {
      patch: {
        tags: ['Incidencias'],
        summary: 'Finaliza una incidencia asignada (empleado de Sistemas)',
        security: seguro,
        parameters: [idParam],
        requestBody: cuerpo(
          { descripcion_resolucion: { type: 'string', example: 'Se reemplazó la fuente' } },
          ['descripcion_resolucion']
        ),
        responses: respuestas(200, 400, 401, 403, 404),
      },
    },

    '/reportes/dashboard': {
      get: {
        tags: ['Reportes'],
        summary: 'Panel de resumen: totales por estado, por fecha e incidencias prioritarias (director)',
        security: seguro,
        responses: respuestas(200, 401, 403),
      },
    },
    '/reportes/incidencias/pdf': {
      get: {
        tags: ['Reportes'],
        summary: 'Reporte estadístico de incidencias en PDF (director)',
        security: seguro,
        responses: {
          200: {
            description: 'Archivo PDF',
            content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
          },
          ...respuestas(401, 403),
        },
      },
    },
  },
};

export default swaggerSpec;