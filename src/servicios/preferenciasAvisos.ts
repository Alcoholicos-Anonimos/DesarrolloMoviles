import Storage from "expo-sqlite/kv-store";

const clave = (usuarioId: string) => `avisos:${usuarioId}`;

// Sin valor guardado => activos (es el valor por defecto del Usuario)
export async function avisosActivosDe(usuarioId: string): Promise<boolean> {
  const valor = await Storage.getItem(clave(usuarioId));
  return valor !== "false";
}

export async function guardarAvisosActivos(
  usuarioId: string,
  activos: boolean,
): Promise<void> {
  await Storage.setItem(clave(usuarioId), String(activos));
}