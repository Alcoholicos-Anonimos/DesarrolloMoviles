import { Reporte, TipoDeReporte, ApiRespuestaExitosa } from '../tipos';
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
};