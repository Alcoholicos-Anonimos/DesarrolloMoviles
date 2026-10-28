import { CambioDeEstado, Cuadrilla, Reporte, TipoDeReporte, Usuario, Zona } from '../tipos';

export const MOCK_TIPOS: TipoDeReporte[] = [
  { id: 'tip-bache', nombre: 'Bache', icono: 'construct', color: '#E67E22', areaResponsable: 'Obras Públicas' },
  { id: 'tip-luminaria', nombre: 'Luminaria apagada', icono: 'bulb', color: '#F1C40F', areaResponsable: 'Alumbrado Público' },
  { id: 'tip-basura', nombre: 'Basura acumulada', icono: 'trash', color: '#7F8C8D', areaResponsable: 'Higiene Urbana' },
  { id: 'tip-rama', nombre: 'Rama o árbol caído', icono: 'leaf', color: '#27AE60', areaResponsable: 'Espacios Verdes' },
  { id: 'tip-agua', nombre: 'Pérdida de agua o cloaca', icono: 'water', color: '#2980B9', areaResponsable: 'Obras Sanitarias' },
  { id: 'tip-semaforo', nombre: 'Semáforo con falla', icono: 'stop-circle', color: '#C0392B', areaResponsable: 'Tránsito' },
  { id: 'tip-vereda', nombre: 'Vereda rota', icono: 'walk', color: '#8E44AD', areaResponsable: 'Obras Públicas' },
  { id: 'tip-otro', nombre: 'Otro problema', icono: 'ellipsis-horizontal-circle', color: '#34495E', areaResponsable: 'Centro de Atención al Vecino' },
];

export const MOCK_REPORTES: Reporte[] = [
  {
    id: 'rep-00412',
    codigo: 'GCHU-2026-00412',
    tipoId: 'tip-bache',
    descripcion: 'Pozo grande en la mano hacia el centro, pasa el agua.',
    audioUrl: null,
    fotos: [{ id: 'fot-901', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7', momento: 'problema' }],
    coordenadas: { latitud: -33.0089, longitud: -58.5142 },
    direccion: 'Rocamora 1240',
    zonaId: 'zon-norte',
    estado: 'asignado',
    autorId: 'usr-084',
    cuadrillaId: 'cua-02',
    duplicadoDe: null,
    adhesiones: 3,
    creadoEn: '2026-09-14T10:22:00-03:00',
    sincronizado: true,
  },
  {
    id: 'rep-00398',
    codigo: 'GCHU-2026-00398',
    tipoId: 'tip-luminaria',
    descripcion: 'Luminaria rota tras la tormenta.',
    audioUrl: null,
    fotos: [{ id: 'fot-902', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5', momento: 'problema' }],
    coordenadas: { latitud: -33.011, longitud: -58.519 },
    direccion: 'Urquiza 1180',
    zonaId: 'zon-centro',
    estado: 'resuelto',
    autorId: 'usr-084',
    cuadrillaId: 'cua-01',
    duplicadoDe: null,
    adhesiones: 1,
    creadoEn: '2026-09-11T16:00:00-03:00',
    sincronizado: true,
  },
  {
    id: 'rep-00355',
    codigo: 'GCHU-2026-00355',
    tipoId: 'tip-rama',
    descripcion: 'Rama caída cortando medio carril.',
    audioUrl: null,
    fotos: [{ id: 'fot-903', url: 'https://images.unsplash.com/photo-1584463699039-9d57a2c6d482', momento: 'problema' }],
    coordenadas: { latitud: -33.004, longitud: -58.522 },
    direccion: 'Bolívar 900',
    zonaId: 'zon-norte',
    estado: 'rechazado',
    autorId: 'usr-084',
    cuadrillaId: null,
    duplicadoDe: null,
    adhesiones: 0,
    creadoEn: '2026-09-08T11:30:00-03:00',
    sincronizado: true,
  },
  {
    id: 'rep-00420',
    codigo: 'GCHU-2026-00420',
    tipoId: 'tip-bache',
    descripcion: 'Pozo en la esquina, ya se rompieron dos cubiertas.',
    audioUrl: null,
    fotos: [{ id: 'fot-904', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7', momento: 'problema' }],
    coordenadas: { latitud: -33.0065, longitud: -58.517 },
    direccion: 'Perón 480',
    zonaId: 'zon-norte',
    estado: 'recibido',
    autorId: 'usr-091',
    cuadrillaId: null,
    duplicadoDe: null,
    adhesiones: 0,
    creadoEn: '2026-09-20T09:15:00-03:00',
    sincronizado: true,
  },
  {
    id: 'rep-00423',
    codigo: 'GCHU-2026-00423',
    tipoId: 'tip-luminaria',
    descripcion: null, // solo audio, sin texto
    audioUrl: 'https://api.gchu.gob.ar/a/423.m4a',
    fotos: [{ id: 'fot-905', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5', momento: 'problema' }],
    coordenadas: { latitud: -33.003, longitud: -58.51 },
    direccion: 'San Martín 350',
    zonaId: 'zon-norte',
    estado: 'en_revision',
    autorId: 'usr-102',
    cuadrillaId: null,
    duplicadoDe: null,
    adhesiones: 2,
    creadoEn: '2026-09-21T19:40:00-03:00',
    sincronizado: true,
  },
  {
    id: 'rep-00426',
    codigo: 'GCHU-2026-00426',
    tipoId: 'tip-bache',
    descripcion: 'Bache enorme frente al kiosco.',
    audioUrl: null,
    fotos: [{ id: 'fot-906', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7', momento: 'problema' }],
    coordenadas: { latitud: -33.009, longitud: -58.5144 }, // a metros del rep-00412: candidato a duplicado
    direccion: 'Rocamora 1250',
    zonaId: 'zon-norte',
    estado: 'recibido',
    autorId: 'usr-115',
    cuadrillaId: null,
    duplicadoDe: null,
    adhesiones: 0,
    creadoEn: '2026-09-22T08:05:00-03:00',
    sincronizado: true,
  },
  {
    id: 'rep-00430',
    codigo: 'GCHU-2026-00430',
    tipoId: 'tip-basura',
    descripcion: 'Contenedor desbordado hace una semana.',
    audioUrl: null,
    fotos: [{ id: 'fot-907', url: 'https://images.unsplash.com/photo-1584463699039-9d57a2c6d482', momento: 'problema' }],
    coordenadas: { latitud: -33.022, longitud: -58.518 },
    direccion: 'Rivadavia 2100',
    zonaId: 'zon-sur',
    estado: 'recibido',
    autorId: 'usr-120',
    cuadrillaId: null,
    duplicadoDe: null,
    adhesiones: 4,
    creadoEn: '2026-09-23T12:30:00-03:00',
    sincronizado: true,
  },
];

export const CAMBIO_ESTADO: CambioDeEstado[] = [
  // rep-00412: el ejemplo de la consigna
  { id: 'cam-1170', reporteId: 'rep-00412', estado: 'recibido', comentario: null, operadorId: null, fechaHora: '2026-09-14T10:22:00-03:00' },
  { id: 'cam-1177', reporteId: 'rep-00412', estado: 'en_revision', comentario: 'Verificado en el lugar', operadorId: 'usr-003', fechaHora: '2026-09-15T08:40:00-03:00' },
  { id: 'cam-1190', reporteId: 'rep-00412', estado: 'asignado', comentario: 'Asignado a Cuadrilla 2', operadorId: 'usr-003', fechaHora: '2026-09-18T11:00:00-03:00' },

  // rep-00398: caso feo "cinco cambios de estado"
  { id: 'cam-1101', reporteId: 'rep-00398', estado: 'recibido', comentario: null, operadorId: null, fechaHora: '2026-09-11T16:00:00-03:00' },
  { id: 'cam-1105', reporteId: 'rep-00398', estado: 'en_revision', comentario: 'Se pidió relevamiento', operadorId: 'usr-003', fechaHora: '2026-09-12T09:10:00-03:00' },
  { id: 'cam-1109', reporteId: 'rep-00398', estado: 'asignado', comentario: 'Cuadrilla 1', operadorId: 'usr-003', fechaHora: '2026-09-12T14:30:00-03:00' },
  { id: 'cam-1112', reporteId: 'rep-00398', estado: 'en_revision', comentario: 'Falta el repuesto, se reprograma', operadorId: 'usr-003', fechaHora: '2026-09-13T10:00:00-03:00' },
  { id: 'cam-1120', reporteId: 'rep-00398', estado: 'resuelto', comentario: 'Luminaria reemplazada', operadorId: 'usr-003', fechaHora: '2026-09-16T17:45:00-03:00' },

  // rep-00355: caso feo "rechazado con motivo largo"
  { id: 'cam-1080', reporteId: 'rep-00355', estado: 'recibido', comentario: null, operadorId: null, fechaHora: '2026-09-08T11:30:00-03:00' },
  { id: 'cam-1086', reporteId: 'rep-00355', estado: 'rechazado', comentario: 'La rama está dentro de un terreno privado y no sobre la vía pública. Según la ordenanza vigente, la poda y el retiro corren por cuenta del propietario. Si la rama llega a caer sobre la vereda o la calle, vuelva a reportarlo y lo atendemos de inmediato.', operadorId: 'usr-003', fechaHora: '2026-09-09T10:20:00-03:00' },
];

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: 'usr-084',
    nombre: 'Vecino de Prueba',
    email: 'vecino@mail.com',
    telefono: null,
    rol: 'vecino',
    zonaId: null,
    avisosActivos: true,
    creadoEn: '2026-08-01T10:00:00-03:00',
  },
  {
    id: 'usr-003',
    nombre: 'Operador Municipal',
    email: 'operador@muni.gob.ar',
    telefono: null,
    rol: 'operador',
    zonaId: 'zon-norte',
    avisosActivos: false,
    creadoEn: '2026-07-15T09:00:00-03:00',
  },
];

// Contraseñas de prueba (solo para el mock, una API real nunca las devuelve)
export const MOCK_CONTRASENAS: Record<string, string> = {
  'usr-084': '123456',
  'usr-003': '123456',
};

// La ciudad tiene cuatro zonas de mantenimiento (límites aproximados)
export const MOCK_ZONAS: Zona[] = [
  {
    id: 'zon-norte', nombre: 'Zona Norte', referente: 'Corralón Norte',
    limite: [
      { latitud: -32.99, longitud: -58.535 }, { latitud: -32.99, longitud: -58.495 },
      { latitud: -33.01, longitud: -58.495 }, { latitud: -33.01, longitud: -58.535 },
    ],
  },
  {
    id: 'zon-centro', nombre: 'Zona Centro', referente: 'Corralón Central',
    limite: [
      { latitud: -33.01, longitud: -58.535 }, { latitud: -33.01, longitud: -58.495 },
      { latitud: -33.018, longitud: -58.495 }, { latitud: -33.018, longitud: -58.535 },
    ],
  },
  {
    id: 'zon-sur', nombre: 'Zona Sur', referente: 'Corralón Sur',
    limite: [
      { latitud: -33.018, longitud: -58.535 }, { latitud: -33.018, longitud: -58.495 },
      { latitud: -33.03, longitud: -58.495 }, { latitud: -33.03, longitud: -58.535 },
    ],
  },
  {
    id: 'zon-quintas', nombre: 'Zona Quintas', referente: 'Corralón Oeste',
    limite: [
      { latitud: -32.99, longitud: -58.56 }, { latitud: -32.99, longitud: -58.535 },
      { latitud: -33.03, longitud: -58.535 }, { latitud: -33.03, longitud: -58.56 },
    ],
  },
];

export const MOCK_CUADRILLAS: Cuadrilla[] = [
  { id: 'cua-01', nombre: 'Cuadrilla 1 — Alumbrado', zonaId: 'zon-centro', especialidad: 'electricidad', activa: true },
  { id: 'cua-02', nombre: 'Cuadrilla 2 — Bacheo', zonaId: 'zon-norte', especialidad: 'pavimento', activa: true },
  { id: 'cua-03', nombre: 'Cuadrilla 3 — Espacios Verdes', zonaId: 'zon-norte', especialidad: 'arbolado', activa: true },
  { id: 'cua-04', nombre: 'Cuadrilla 4 — Alumbrado Norte', zonaId: 'zon-norte', especialidad: 'electricidad', activa: false },
  { id: 'cua-05', nombre: 'Cuadrilla 5 — Higiene', zonaId: 'zon-sur', especialidad: 'residuos', activa: true },
];