import { Directory, File, Paths } from "expo-file-system";
import { NuevoReporteInput } from "../tipos";

// Carpeta permanente de la app. A diferencia de la caché, Android no la vacía solo.
const carpetaReportes = new Directory(Paths.document, "reportes");

function asegurarCarpeta() {
  if (!carpetaReportes.exists) {
    carpetaReportes.create();
  }
}

// Copia un archivo (foto o audio) a la carpeta permanente y devuelve su nueva ruta.
export function guardarArchivoPermanente(uriOrigen: string): string {
  asegurarCarpeta();

  const coincidencia = uriOrigen.match(/\.([a-zA-Z0-9]+)$/);
  const extension = coincidencia ? coincidencia[1] : "bin";
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const origen = new File(uriOrigen);
  const destino = new File(carpetaReportes, nombre);
  origen.copy(destino);

  return destino.uri;
}

// Aplica lo anterior a todas las fotos y al audio de un reporte.
export function guardarArchivosDelReporte(
  input: NuevoReporteInput,
): NuevoReporteInput {
  return {
    ...input,
    audioUrl: input.audioUrl ? guardarArchivoPermanente(input.audioUrl) : null,
    fotos: input.fotos.map((foto) => ({
      ...foto,
      url: guardarArchivoPermanente(foto.url),
    })),
  };
}
