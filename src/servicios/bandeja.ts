import {
  ApiRespuestaExitosa,
  CambioDeEstado,
  Cuadrilla,
  EstadoReporte,
  Reporte,
  Zona,
} from '../tipos';
import {
  CAMBIO_ESTADO,
  MOCK_CUADRILLAS,
  MOCK_REPORTES,
  MOCK_ZONAS,
} from '../mocks/datos';

export interface FiltrosBandeja {
  zonaId: string | null;
  estado: EstadoReporte | null;
  tipoId: string | null;
}

const esperar = () => new Promise((res) => setTimeout(res, 300)); // Latencia simulada

// Registra un cambio en el historial del reporte
const registrarCambio = (
  reporteId: string,
  estado: EstadoReporte,
  comentario: string | null,
  operadorId: string
) => {
  const cambio: CambioDeEstado = {
    id: `cam-${Date.now()}`,
    reporteId,
    estado,
    comentario,
    operadorId,
    fechaHora: new Date().toISOString(),
  };
  CAMBIO_ESTADO.push(cambio);
};

const buscarReporte = (reporteId: string): Reporte => {
  const reporte = MOCK_REPORTES.find((r) => r.id === reporteId);
  if (!reporte) throw new Error('No encontramos el reporte.');
  return reporte;
};

export const bandejaService = {
  // Lista de reportes para el operador, con filtros
  listar: async (filtros: FiltrosBandeja): Promise<ApiRespuestaExitosa<Reporte[]>> => {
    await esperar();
    const datos = MOCK_REPORTES
      .filter((r) => !filtros.zonaId || r.zonaId === filtros.zonaId)
      .filter((r) => !filtros.estado || r.estado === filtros.estado)
      .filter((r) => !filtros.tipoId || r.tipoId === filtros.tipoId)
      // Más vecinos sumados = más arriba; si empatan, el más nuevo primero
      .sort((a, b) => b.adhesiones - a.adhesiones || b.creadoEn.localeCompare(a.creadoEn));

    return { datos, meta: { total: datos.length, pagina: 1, porPagina: 20 } };
  },

  // Cambia el estado dejando escrito por qué
  cambiarEstado: async (
    reporteId: string,
    estado: EstadoReporte,
    comentario: string,
    operadorId: string
  ): Promise<ApiRespuestaExitosa<Reporte>> => {
    await esperar();
    if (!comentario.trim()) {
      throw new Error('Escribí un comentario explicando el cambio.');
    }
    const reporte = buscarReporte(reporteId);
    reporte.estado = estado;
    registrarCambio(reporteId, estado, comentario.trim(), operadorId);
    return { datos: reporte };
  },

  // Asigna una cuadrilla y pasa el reporte a "asignado"
  asignarCuadrilla: async (
    reporteId: string,
    cuadrillaId: string,
    operadorId: string
  ): Promise<ApiRespuestaExitosa<Reporte>> => {
    await esperar();
    const cuadrilla = MOCK_CUADRILLAS.find((c) => c.id === cuadrillaId);
    if (!cuadrilla || !cuadrilla.activa) {
      throw new Error('La cuadrilla no está disponible.');
    }
    const reporte = buscarReporte(reporteId);
    reporte.cuadrillaId = cuadrillaId;
    reporte.estado = 'asignado';
    registrarCambio(reporteId, 'asignado', `Asignado a ${cuadrilla.nombre}`, operadorId);
    return { datos: reporte };
  },

  // Marca un reporte como duplicado de otro
  marcarDuplicado: async (
    reporteId: string,
    originalId: string,
    operadorId: string
  ): Promise<ApiRespuestaExitosa<Reporte>> => {
    await esperar();
    if (reporteId === originalId) {
      throw new Error('Un reporte no puede ser duplicado de sí mismo.');
    }
    const reporte = buscarReporte(reporteId);
    const original = buscarReporte(originalId);
    reporte.duplicadoDe = originalId;
    original.adhesiones += 1; // el vecino "se suma" al reporte original
    registrarCambio(
      reporteId,
      reporte.estado,
      `Marcado como duplicado de ${original.codigo}`,
      operadorId
    );
    return { datos: reporte };
  },

  // Cuadrillas activas (opcionalmente de una zona)
  obtenerCuadrillas: async (zonaId: string | null): Promise<Cuadrilla[]> => {
    await esperar();
    return MOCK_CUADRILLAS.filter(
      (c) => c.activa && (!zonaId || c.zonaId === zonaId)
    );
  },

  obtenerZonas: async (): Promise<Zona[]> => {
    await esperar();
    return MOCK_ZONAS;
  },
};