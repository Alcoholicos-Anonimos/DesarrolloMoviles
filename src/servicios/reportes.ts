import { Reporte, TipoDeReporte, ApiRespuestaExitosa, NuevoReporteInput } from '../tipos';
import { MOCK_REPORTES, MOCK_TIPOS } from '../mocks/datos';

export const reportesService = {
  // Obtiene todos los reportes simulando una petición a la API
  obtenerMisReportes: async (): Promise<ApiRespuestaExitosa<Reporte[]>> => {
    await new Promise((res) => setTimeout(res, 300)); // Simula latencia
    return {
      datos: MOCK_REPORTES,
      meta: {
        total: MOCK_REPORTES.length,
        pagina: 1,
        porPagina: 20,
      },
    };
  },

  // Obtiene los tipos de reporte para saber nombre, ícono y color
  obtenerTipos: async (): Promise<TipoDeReporte[]> => {
    return MOCK_TIPOS;
  },

  // Crea un nuevo reporte y lo agrega a la lista simulada
  crearReporte: async (input: NuevoReporteInput): Promise<ApiRespuestaExitosa<Reporte>> => {
    await new Promise((res) => setTimeout(res, 300));
    const nuevoReporte: Reporte = {
      id: `rep-${Date.now()}`,
      codigo: `GCHU-2026-${Math.floor(Math.random() * 100000)}`,
      estado: 'recibido',
      autorId: 'usr-084',
      cuadrillaId: null,
      duplicadoDe: null,
      adhesiones: 0,
      creadoEn: new Date().toISOString(),
      sincronizado: false,
      zonaId: 'zon-norte',
      ...input,
    };
    MOCK_REPORTES.push(nuevoReporte);
    return { datos: nuevoReporte };
  },
};