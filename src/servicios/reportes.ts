import { Reporte, TipoDeReporte, ApiRespuestaExitosa, NuevoReporteInput, CambioDeEstado } from '../tipos';
import { CAMBIO_ESTADO, MOCK_REPORTES, MOCK_TIPOS } from '../mocks/datos';

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

  // Reportes públicos para el mapa de la ciudad (cualquier vecino los ve)
  obtenerReportesPublicos: async (): Promise<ApiRespuestaExitosa<Reporte[]>> => {
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

  // Un vecino se suma a un reporte existente en vez de crear otro duplicado
  sumarseAReporte: async (reporteId: string): Promise<ApiRespuestaExitosa<Reporte>> => {
    await new Promise((res) => setTimeout(res, 300));
    const reporte = MOCK_REPORTES.find((r) => r.id === reporteId);
    if (!reporte) {
      throw new Error("No encontramos el reporte.");
    }
    reporte.adhesiones += 1;
    return { datos: reporte };
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

  //Obtengo un reporte por id
  obtenerMisReportesPorId: async (id: string): Promise<ApiRespuestaExitosa<Reporte | undefined>> => {
    await new Promise((res) => setTimeout(res, 300)); // Simula latencia
    return {
      datos: MOCK_REPORTES.find(x => x.id === id),
      meta: {
        total: 1,
        pagina: 1,
        porPagina: 1,
      },
    };
  },


  listarCambiosDeEstado : async (id:string) : Promise <ApiRespuestaExitosa <CambioDeEstado[] | undefined>> =>{
    await new Promise((res) => setTimeout(res, 300)); // Simula latencia
    const cambios = CAMBIO_ESTADO.filter(x => x.reporteId === id);
    return {
      datos: cambios.length ? cambios : undefined,
      meta: {
        total: cambios.length,
        pagina: 1,
        porPagina: cambios.length || 1,
      },
    };
  }
}