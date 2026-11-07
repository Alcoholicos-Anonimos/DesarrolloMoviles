import {
  ApiRespuestaExitosa,
  CambioDeEstado,
  Cuadrilla,
  EstadoReporte,
  Reporte,
  Zona,
} from "../tipos";
import { avisarAdhesion, avisarCambioDeEstado } from "./avisos";
import { reportesService } from "./reportes";
import { zonasService } from "./zonas";

export interface FiltrosBandeja {
  zonaId: string | null;
  estado: EstadoReporte | null;
  tipoId: string | null;
}

export type FiltroEstado = EstadoReporte[] | "todos";
//const esperar = () => new Promise((res) => setTimeout(res, 300)); // Latencia simulada

// Registra un cambio en el historial del reporte
const registrarCambio = async (
  reporteId: string,
  estado: EstadoReporte,
  comentario: string,
  operadorId: string,
) => {
  const cambio: CambioDeEstado = {
    id: `cam-${Date.now()}`,
    reporteId,
    estado,
    comentario,
    operadorId,
    fechaHora: new Date().toISOString(),
  };
  //CAMBIO_ESTADO.push(cambio);
  await reportesService.cambiarEstado(reporteId, estado, comentario);
};

const buscarReporte = async (reporteId: string): Promise<Reporte> => {
  const resp = await reportesService.obtenerMisReportesPorId(reporteId);
  const reporte = resp.datos;
  if (!reporte) throw new Error("No encontramos el reporte.");
  return reporte;
};

export const bandejaService = {
  // Lista de reportes para el operador, con filtros
 listar: async (
    filtros: FiltrosBandeja,
  ): Promise<ApiRespuestaExitosa<Reporte[]>> => {
    //await esperar();
    const resp = await reportesService.obtenerReportesPublicos(
      filtros.estado ? [filtros.estado] : "todos",
    );
    
    const datos = resp.datos.filter(
      (r) => !filtros.zonaId || r.zonaId === filtros.zonaId,
    )
      .filter((r) => !filtros.estado || r.estado === filtros.estado)
      .filter((r) => !filtros.tipoId || r.tipoId === filtros.tipoId)
      // Más vecinos sumados = más arriba; si empatan, el más nuevo primero
      .sort(
        (a, b) =>
          b.adhesiones - a.adhesiones || b.creadoEn.localeCompare(a.creadoEn),
      );
    
    return { datos, meta: { total: datos.length, pagina: 1, porPagina: 20 } };
  },


  // Cambia el estado dejando escrito por qué
  cambiarEstado: async (
    reporteId: string,
    estado: EstadoReporte,
    comentario: string,
    operadorId: string,
    fotoArreglo?: string,
  ): Promise<ApiRespuestaExitosa<Reporte>> => {
    //await esperar();
    if (!comentario.trim()) {
      throw new Error("Escribí un comentario explicando el cambio.");
    }
    const reporte = await buscarReporte(reporteId);
    // La foto va antes del cambio: la API la acepta con el reporte en "asignado".
    // Si falla la subida, el reporte no queda resuelto sin prueba.
    if (estado === "resuelto") {
      if (!fotoArreglo) {
        throw new Error("Sacá una foto del arreglo para marcarlo como resuelto.");
      }
      await reportesService.agregarFotoArreglo(reporteId, fotoArreglo);
    }
    reporte.estado = estado;
    await registrarCambio(reporteId, estado, comentario.trim(), operadorId);
    await avisarCambioDeEstado(reporte, estado, comentario.trim());
    return { datos: reporte };
  },

  // Asigna una cuadrilla y pasa el reporte a "asignado"
  asignarCuadrilla: async (
    reporteId: string,
    cuadrillaId: string,
    operadorId: string,
  ): Promise<ApiRespuestaExitosa<Reporte>> => {
    //await esperar();

    const resp = await zonasService.listarCuadrillas();
    const cuadrilla = resp.datos.find((c) => c.id === cuadrillaId);
    if (!cuadrilla || !cuadrilla.activa) {
      throw new Error("La cuadrilla no está disponible.");
    }
    const reporte = await buscarReporte(reporteId);

    const enviar = await reportesService.asignarCuadrilla(reporteId, cuadrillaId, cuadrilla.nombre + " " + cuadrilla.especialidad);
    // reporte.cuadrillaId = cuadrillaId;
    // reporte.estado = "asignado";
    // await registrarCambio(
    //   reporteId,
    //   "asignado",
    //   `Asignado a ${cuadrilla.nombre}`,
    //   operadorId,
    // );
    await avisarCambioDeEstado(reporte, "asignado", `Asignado a ${cuadrilla.nombre}`);
    return { datos: enviar.datos };
  },

  // Marca un reporte como duplicado de otro.
  // Según Germán (foro): se guarda duplicadoDe, el estado pasa a rechazado,
  // el comentario dice "Reclamo duplicado de este: <id del original>"
  // y el reporte original suma una adhesión.
  marcarDuplicado: async (
    reporteId: string,
    originalId: string,
    operadorId: string,
  ): Promise<ApiRespuestaExitosa<Reporte>> => {
    //await esperar();
    if (reporteId === originalId) {
      throw new Error("Un reporte no puede ser duplicado de sí mismo.");
    }
    const reporte = await buscarReporte(reporteId);
    const original = await buscarReporte(originalId);
    reporte.duplicadoDe = original.id;
    reporte.estado = "rechazado";
    original.adhesiones += 1;
    // registrarCambio(
    //   reporteId,
    //   "rechazado",
    //   `Reclamo duplicado de este: ${original.id}`,
    //   operadorId,
    // );
    await reportesService.duplicado(reporteId, originalId);
    await avisarCambioDeEstado(reporte, "rechazado", null);
    await avisarAdhesion(original);
    return { datos: reporte };
  },

  // Cuadrillas activas (opcionalmente de una zona)
  obtenerCuadrillas: async (zonaId: string | null): Promise<Cuadrilla[]> => {
    //await esperar();
    const resp = await zonasService.listarCuadrillas();
    return resp.datos.filter(
      (c) => c.activa && (!zonaId || c.zonaId === zonaId),
    );
  },

  obtenerZonas: async (): Promise<Zona[]> => {
    //await esperar();
    return await zonasService.listarZonas().then((resp) => resp.datos);
  },
};
