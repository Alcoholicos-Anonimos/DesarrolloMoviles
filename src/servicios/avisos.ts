import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { EstadoReporte, Reporte } from "../tipos";
import { avisosActivosDe } from "./preferenciasAvisos";

const CANAL = "avisos";

const TEXTO_ESTADO: Record<EstadoReporte, string> = {
  recibido: "Recibimos tu reclamo",
  en_revision: "Tu reclamo está en revisión",
  asignado: "Tu reclamo fue asignado a una cuadrilla",
  resuelto: "¡Tu reclamo fue resuelto!",
  rechazado: "Tu reclamo fue rechazado. Tocá para ver el motivo",
};

// Se llama una vez al abrir la app.
export async function configurarAvisos() {
  // Qué hacer si llega una notificación con la app abierta: mostrarla igual.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  // Android 8+ exige un "canal". Tiene que existir antes de pedir permiso.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: "Avisos de mis reclamos",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function tengoPermiso(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

// Pide el permiso del sistema si todavía no lo tenemos.
export async function pedirPermiso(): Promise<boolean> {
  if (await tengoPermiso()) return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Muestra la notificación ahora mismo. Si algo falla, NO tiene que romper la
// acción del operador: un aviso que no sale no debe deshacer un cambio de estado.
async function mostrar(titulo: string, cuerpo: string, reporteId: string) {
  try {
    if (!(await tengoPermiso())) return;
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: cuerpo, data: { reporteId } },
      trigger: Platform.OS === "android" ? { channelId: CANAL } : null,
    });
  } catch (error) {
    console.warn("No se pudo mostrar el aviso:", error);
  }
}

// Aviso 1: cambió el estado de un reporte tuyo
export async function avisarCambioDeEstado(
  reporte: Reporte,
  estado: EstadoReporte,
  comentario: string | null,
) {
  if (!(await avisosActivosDe(reporte.autorId))) return;
  const cuerpo =
    estado === "rechazado" || !comentario
      ? TEXTO_ESTADO[estado]
      : `${TEXTO_ESTADO[estado]}. ${comentario}`;
  await mostrar(`Reclamo ${reporte.codigo}`, cuerpo, reporte.id);
}

// Aviso 2: alguien se sumó a un reporte tuyo (no decimos quién: datos sensibles)
export async function avisarAdhesion(reporte: Reporte) {
  if (!(await avisosActivosDe(reporte.autorId))) return;
  await mostrar(
    `Reclamo ${reporte.codigo}`,
    `Se sumó otro vecino a tu reclamo. Ya son ${reporte.adhesiones}.`,
    reporte.id,
  );
}