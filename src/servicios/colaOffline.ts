import * as SQLite from "expo-sqlite";
import { NuevoReporteInput } from "../tipos";
import { reportesService } from "./reportes";

const db = SQLite.openDatabaseSync("reportes_offline.db");

// Se ejecuta una sola vez, crea la tabla si todavía no existe.
export function inicializarBaseDeDatos() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS reportes_pendientes (
      id TEXT PRIMARY KEY NOT NULL,
      datos TEXT NOT NULL,
      creado_en TEXT NOT NULL
    );
  `);
}

// Guarda un reporte pendiente y devuelve el id local generado.
export async function guardarReportePendiente(
  input: NuevoReporteInput,
): Promise<string> {
  const id = `local-${Date.now()}`;
  await db.runAsync(
    "INSERT INTO reportes_pendientes (id, datos, creado_en) VALUES (?, ?, ?);",
    id,
    JSON.stringify(input),
    new Date().toISOString(),
  );
  return id;
}

// Trae todos los reportes que todavía no se subieron.
export async function obtenerReportesPendientes(): Promise<
  { id: string; input: NuevoReporteInput }[]
> {
  const filas = await db.getAllAsync<{ id: string; datos: string }>(
    "SELECT id, datos FROM reportes_pendientes;",
  );
  return filas.map((fila) => ({
    id: fila.id,
    input: JSON.parse(fila.datos) as NuevoReporteInput,
  }));
}

// Borra un reporte pendiente una vez que se subió con éxito.
export async function eliminarReportePendiente(id: string): Promise<void> {
  await db.runAsync("DELETE FROM reportes_pendientes WHERE id = ?;", id);
}

// Intenta subir todos los reportes pendientes; borra de la cola los que suben bien.

export async function sincronizarPendientes(): Promise<void> {
  const pendientes = await obtenerReportesPendientes();

  for (const { id, input } of pendientes) {
    try {
      await reportesService.crearReporte(input);
      await eliminarReportePendiente(id);
      console.log(`Reporte ${id} sincronizado y eliminado de la cola`);
    } catch {}
  }
}
