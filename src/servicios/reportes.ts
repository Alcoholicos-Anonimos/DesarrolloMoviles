
import almacen from "expo-sqlite/kv-store";
import { CAMBIO_ESTADO, MOCK_REPORTES, MOCK_TIPOS } from '../mocks/datos';
import { ApiRespuestaExitosa, CambioDeEstado, Cuadrilla, NuevoReporteInput, Reporte, TipoDeReporte, Zona } from '../tipos';

import { api } from '@/api/clienteHttp';

const CLAVE_TIPOS = "catalogo_tipos_de_reporte";

// Sube una foto o un audio y devuelve la URL que la API pide en el reporte.
async function subirArchivo(
  uriLocal: string,
  tipo: "imagen" | "audio",
): Promise<string> {
  const formulario = new FormData();
  formulario.append("archivo", {
    uri: uriLocal,
    name: tipo === "imagen" ? "foto.jpg" : "audio.m4a",
    type: tipo === "imagen" ? "image/jpeg" : "audio/mp4",
  } as unknown as Blob);

  const respuesta = await api.post("archivos", formulario, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30_000,
  });
  return respuesta.data.datos.url as string;
}

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
  // Tipos de problema: primero la API; sin conexión, el último listado guardado;
  // y si nunca se bajó ninguno, la lista que viene en la app (los mismos 8 de la API).
  obtenerTipos: async (): Promise<TipoDeReporte[]> => {
    try {
      const respuesta = await api.get("tipos-de-reporte", { timeout: 5000 });
      const tipos = respuesta.data.datos as TipoDeReporte[];
      almacen.setItem(CLAVE_TIPOS, JSON.stringify(tipos)).catch(() => {});
      return tipos;
    } catch {
      const guardado = await almacen.getItem(CLAVE_TIPOS);
      if (guardado) return JSON.parse(guardado) as TipoDeReporte[];
      return MOCK_TIPOS;
    }
  },
  
  // Crea el reporte en la API: primero sube los archivos y después manda el reporte con sus URLs.
  crearReporte: async (input: NuevoReporteInput): Promise<ApiRespuestaExitosa<Reporte>> => {
    const urlsDeFotos: string[] = [];
    for (const foto of input.fotos) {
      urlsDeFotos.push(await subirArchivo(foto.url, "imagen"));
    }
    const audioUrl = input.audioUrl
      ? await subirArchivo(input.audioUrl, "audio")
      : null;

    const respuesta = await api.post("reportes", {
      id: input.id,
      tipoId: input.tipoId,
      descripcion: input.descripcion,
      audioUrl,
      fotos: urlsDeFotos.map((url) => ({ url })),
      coordenadas: input.coordenadas,
      direccion: input.direccion,
      creadoEn: input.creadoEn,
    });
    return respuesta.data;
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
,
  listarZonas : async () : Promise <ApiRespuestaExitosa <Zona[] >> => {
      const respuesta = await api.get("zonas");
      console.log(respuesta.data.datos);
      return  respuesta.data;
     
  },

    listarCuadrillas : async () : Promise <ApiRespuestaExitosa <Cuadrilla[] >> => {
      const resp = await api.get("cuadrillas");
      return resp.data;
     
  },
}