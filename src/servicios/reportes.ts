import {
  ApiRespuestaExitosa,
  CambioDeEstado,
  EstadoReporte,
  NuevoReporteInput,
  Reporte,
  TipoDeReporte,
  Zona
} from '../tipos';

import { api } from "@/api/clienteHttp";
import almacen from "expo-sqlite/kv-store";
import { MOCK_TIPOS } from "../mocks/datos";

const CLAVE_TIPOS = "tipos-de-reporte";

const ESTADOS: Record<EstadoReporte, true> = {
  recibido: true,
  en_revision: true,
  asignado: true,
  resuelto: true,
  rechazado: true,
};
export const TODOS_LOS_ESTADOS = Object.keys(ESTADOS) as EstadoReporte[];
export type FiltroEstado = EstadoReporte[] | "todos";

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
  } as any);

  const respuesta = await api.post("archivos", formulario, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30_000,
  });
  return respuesta.data.datos.url as string;
}

export const reportesService = {

  asignarCuadrilla: async (
    reporteId: string,
    cuadrillaId: string,
    comentario: string
  ): Promise<ApiRespuestaExitosa<Reporte>> => {
    const resp = await api.patch(`reportes/${reporteId}/cuadrilla`, { cuadrillaId, comentario });
    return resp.data;
  },
  obtenerMisReportes: async (): Promise<ApiRespuestaExitosa<Reporte[]>> => {
    const resp = await api.get("yo/reportes");
    return resp.data;
  },

  // Reportes públicos para el mapa de la ciudad (cualquier vecino los ve)
  obtenerReportesPublicos: async (estados?: FiltroEstado): Promise<ApiRespuestaExitosa<Reporte[]>> => {
    // parametro estado: Uno o varios estados separados por coma. Sin este filtro no se incluyen los rechazado.
    const lista = estados === "todos" ? TODOS_LOS_ESTADOS : estados;
    const resp = await api.get("reportes", {
      params: lista?.length ? { estado: lista.join(",") } : undefined,
    });
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
  obtenerTipos: async (): Promise<ApiRespuestaExitosa<TipoDeReporte[]>> => {
    try {
      const resp = await api.get("tipos-de-reporte", { timeout: 5000 });
      almacen.setItem(CLAVE_TIPOS, JSON.stringify(resp.data.datos)).catch(() => { });
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

  // Obtengo un reporte por id
  obtenerMisReportesPorId: async (id: string): Promise<ApiRespuestaExitosa<Reporte>> => {
    const resp = await api.get("reportes/" + id);
    return resp.data;
  },

  listarCambiosDeEstado: async (id: string): Promise<ApiRespuestaExitosa<CambioDeEstado[]>> => {
    const resp = await api.get("reportes/" + id + "/cambios");
    return resp.data;
  },

  cambiarEstado: async (
    reporteId: string,
    estado: string,
    comentario: string): Promise<ApiRespuestaExitosa<Reporte>> => {
    const resp = await api.patch(`reportes/${reporteId}/estado`, { estado, comentario });
    return resp.data;
  },

  duplicado: async (
    reporteId: string,
    originalId: string
  ): Promise<ApiRespuestaExitosa<Reporte>> => {
    const resp = await api.post(`reportes/${reporteId}/duplicado`, { originalId });
    return resp.data;
  },

  // 👇 LA FUNCIÓN QUE FALTABA Y ROMPÍA LA PANTALLA 👇
  listarZonas: async (): Promise<ApiRespuestaExitosa<Zona[]>> => {
    const resp = await api.get("zonas");
    return resp.data;
  },

}