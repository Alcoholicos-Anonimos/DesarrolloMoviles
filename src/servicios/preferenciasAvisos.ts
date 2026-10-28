import { api } from "@/api/clienteHttp";
import Storage from "expo-sqlite/kv-store";
import { ApiRespuestaExitosa, Usuario } from "../tipos";

const clave = (usuarioId: string) => `avisos:${usuarioId}`;

export async function avisosActivosDe(usuarioId: string): Promise<boolean> {
  try {
    const resp = await api.get("yo");
    const { datos } = resp.data as ApiRespuestaExitosa<Usuario>;

    // Guardamos lo que dijo el servidor para poder usarlo sin conexión.
    await Storage.setItem(clave(usuarioId), String(datos.avisosActivos));
    return datos.avisosActivos;
  } catch {
    // Sin conexión o la API fallo: usamos el ultimo valor guardado.
    const valor = await Storage.getItem(clave(usuarioId));
    return valor !== "false";
  }

}

export async function guardarAvisosActivos(
  usuarioId: string,
  activos: boolean,
): Promise<void> {
  const resp = await api.patch("yo", { avisosActivos: activos });
  const { datos } = resp.data as ApiRespuestaExitosa<Usuario>;
 
  // Actualizamos el cache 
  await Storage.setItem(clave(usuarioId), String(datos.avisosActivos));
}