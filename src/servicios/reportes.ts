
<<<<<<< HEAD
import almacen from "expo-sqlite/kv-store";
import { MOCK_REPORTES, MOCK_TIPOS } from '../mocks/datos';
import { ApiRespuestaExitosa, CambioDeEstado, Cuadrilla, NuevoReporteInput, Reporte, TipoDeReporte, Zona } from '../tipos';
=======
import { ApiRespuestaExitosa, CambioDeEstado, NuevoReporteInput, Reporte, TipoDeReporte } from '../tipos';
>>>>>>> main

import { api } from '@/api/clienteHttp';


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

  obtenerMisReportes: async (): Promise<ApiRespuestaExitosa<Reporte[]>> => {
    const resp = await api.get("yo/reportes");
    return resp.data;

  },

  // Reportes públicos para el mapa de la ciudad (cualquier vecino los ve)
  obtenerReportesPublicos: async (): Promise<ApiRespuestaExitosa<Reporte[]>> => {
    const resp = await api.get("reportes");
    return resp.data;
  },

  // Un vecino se suma a un reporte existente en vez de crear otro duplicado

  sumarseAReporte: async (id: string): Promise<{ status: number; datos: Reporte }> => {
    const resp = await api.post("reportes/" + id + "/adhesiones");

    return {
      status: resp.status,
      datos: resp.data.datos,
    };
  },


  // Tipos de problema: primero la API; sin conexión, el último listado guardado;
  // y si nunca se bajó ninguno, la lista que viene en la app (los mismos 8 de la API).
  // Nunca falla: el formulario tiene que poder armarse sin señal.
  obtenerTipos: async (): Promise<ApiRespuestaExitosa<TipoDeReporte[]>> => {
    try {
      const resp = await api.get("tipos-de-reporte", { timeout: 5000 });
      almacen.setItem(CLAVE_TIPOS, JSON.stringify(resp.data.datos)).catch(() => {});
      return resp.data;
    } catch {
      let datos: TipoDeReporte[] = MOCK_TIPOS;
      try {
        const guardado = await almacen.getItem(CLAVE_TIPOS);
        if (guardado) datos = JSON.parse(guardado) as TipoDeReporte[];
      } catch {
        // Si el listado guardado no se puede leer, usamos el que viene en la app
      }
      return { datos };
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
  obtenerMisReportesPorId: async (id: string): Promise<ApiRespuestaExitosa<Reporte>> => {
    const resp = await api.get("reportes/" + id);
    return resp.data;
  },

  listarCambiosDeEstado: async (id: string): Promise<ApiRespuestaExitosa<CambioDeEstado[]>> => {
    const resp = await api.get("reportes/" + id + "/cambios");
    return resp.data;
  },

  
}