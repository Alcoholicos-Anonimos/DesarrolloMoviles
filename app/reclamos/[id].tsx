import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from "@react-native-vector-icons/ionicons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Linking from "expo-linking";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { reportesService } from "../../src/servicios/reportes";
import { CambioDeEstado, EstadoReporte, Reporte } from "../../src/tipos";
import { espaciados, estilosComunes, obtenerColores, obtenerColoresEstado, pesosFuente, radios, tipografia } from "../../styles/theme";

const ETIQUETA_ESTADO: Record<EstadoReporte, string> = {
  recibido: "Recibido",
  en_revision: "En revisión",
  asignado: "Asignado a cuadrilla",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
};

function formatearFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

// Genera la imagen del QR con un servicio gratuito, sin librería nativa.
function urlQR(texto: string, tamano = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${tamano}x${tamano}&data=${encodeURIComponent(
    texto
  )}`;
}

export function crearLinkDetalle(idReporte: string) {
  return Linking.createURL(`/reclamos/${idReporte}`);
}
export default function DetalleReporte() {
  const colorScheme = useColorScheme();

  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const coloresEstado = obtenerColoresEstado(tema);
  const styles = crearStyles(tema); //Creamos el estilo segun el color del modo del dispositivo
  const { id } = useLocalSearchParams<{ id: string }>();

  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [cambios, setCambios] = useState<CambioDeEstado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarQR, setMostrarQR] = useState(false);
  const player = useAudioPlayer(reporte?.audioUrl ?? null);
  const statusAudio = useAudioPlayerStatus(player);

  const alternarAudio = () => {
    if (statusAudio.playing) {
      player.pause();
    } else {
      if (statusAudio.didJustFinish || statusAudio.currentTime >= statusAudio.duration) {
        player.seekTo(0);
      }
      player.play();
    }
  };
   useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);
  
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [resReporte, resCambios] = await Promise.all([
          reportesService.obtenerMisReportesPorId(id),
          reportesService.listarCambiosDeEstado(id),
        ]);
        setReporte(resReporte.datos ?? null);
        const cambiosData = resCambios.datos ?? [];
        // Mostrar del más viejo al más nuevo, para leer el timeline de arriba hacia abajo.
        setCambios(
          [...cambiosData].sort((a, b) =>
            a.fechaHora.localeCompare(b.fechaHora)
          )
        );
      } catch {
        setError("No pudimos cargar este reclamo. Probá de nuevo.");
      } finally {
        setCargando(false);
      }
    })();
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !reporte) {
    return (
      <View style={styles.centro}>
        <Text style={styles.textoError}>
          {error ?? "No encontramos este reclamo."}
        </Text>
      </View>
    );
  }

  const colorEstado = coloresEstado[reporte.estado];
  const fotoProblema = reporte.fotos.find((f) => f.momento === "problema");
  const fotoArreglo = reporte.fotos.find((f) => f.momento === "arreglo");

  // El motivo de rechazo vive en el último cambio de estado a "rechazado".
  const motivoRechazo =
    reporte.estado === "rechazado"
      ? [...cambios].reverse().find((c) => c.estado === "rechazado")?.comentario
      : null;

  const linkDetalle = crearLinkDetalle(String(reporte.id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back-outline" size={24} color={colores.texto} />
          </Pressable>
          <Text style={styles.headerCodigo}>{reporte.codigo}</Text>
          <Pressable onPress={() => setMostrarQR(true)} hitSlop={12}>
            <Ionicons name="qr-code-outline" size={24} color={colores.texto} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.contenido}>
          <Text style={styles.titulo}>{reporte.direccion}</Text>

          <View
            style={[styles.badge, { backgroundColor: colorEstado.fondo }]}
          >
            <Text style={[styles.badgeTexto, { color: colorEstado.texto }]}>
              {ETIQUETA_ESTADO[reporte.estado]}
            </Text>
          </View>

          {reporte.adhesiones > 0 && (
            <View style={styles.filaAdhesiones}>
              <Ionicons name="people-outline" size={14} color={colores.textoSecundario} />
              <Text style={styles.textoAdhesiones}>
                {reporte.adhesiones} vecino{reporte.adhesiones === 1 ? "" : "s"}{" "}
                se sumaron
              </Text>
            </View>
          )}

          {/* "Rechazado" a secas genera más enojo que no contestar. */}
          {motivoRechazo && (
            <View style={styles.cajaMotivo}>
              <Text style={styles.cajaMotivoTitulo}>Por qué se rechazó</Text>
              <Text style={styles.cajaMotivoTexto}>{motivoRechazo}</Text>
            </View>
          )}

          {fotoProblema && (
            <Image source={{ uri: fotoProblema.url }} style={styles.foto} />
          )}

          {reporte.descripcion && (
            <Text style={styles.descripcion}>{reporte.descripcion}</Text>
          )}

          {reporte.audioUrl && (
            <Pressable style={styles.botonAudio} onPress={alternarAudio}>
              {!statusAudio.isLoaded ? (
                <ActivityIndicator size="small" />
              ) : (
                <Ionicons
                  name={statusAudio.playing ? "pause-circle-outline" : "play-circle-outline"}
                  size={20}
                  color={colores.texto}
                />
              )}
              <Text style={styles.botonAudioTexto}>
                {statusAudio.playing ? "Pausar nota de voz" : "Escuchar nota de voz"}
              </Text>
            </Pressable>
          )}

          {/* La foto del arreglo es lo que más nos van a agradecer. */}
          {reporte.estado === "resuelto" && fotoArreglo && (
            <View style={styles.bloqueArreglo}>
              <Text style={styles.subtitulo}>Así quedó</Text>
              <Image source={{ uri: fotoArreglo.url }} style={styles.foto} />
            </View>
          )}

          <Text style={styles.subtitulo}>Qué fue pasando</Text>
          <View style={styles.timeline}>
            {cambios.map((c, i) => (
              <View key={c.id} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    i === cambios.length - 1 && styles.timelineDotActivo,
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.timelineFecha}>
                    {formatearFecha(c.fechaHora)}
                  </Text>
                  <Text style={styles.timelineEstado}>
                    {ETIQUETA_ESTADO[c.estado]}
                  </Text>
                  {c.comentario && (
                    <Text style={styles.timelineComentario}>{c.comentario}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* QR para mostrarlo en el mostrador — lo escanea la operadora. */}
        <Modal visible={mostrarQR} transparent animationType="fade">
          <Pressable
            style={styles.fondoModal}
            onPress={() => setMostrarQR(false)}
          >
            <View style={styles.tarjetaQR}>
              <Image
                source={{ uri: urlQR(linkDetalle) }}
                style={{ width: 200, height: 200 }}
              />
              <Text style={styles.textoQR}>{reporte.codigo}</Text>
              <Text style={styles.subtextoQR}>
                Mostrá esto en el mostrador
              </Text>
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: colores.fondo,
      paddingHorizontal: espaciados.extraGrande,
    },

    centro: {
      ...estilosComunes.centro,
    },

    textoError: {
      ...tipografia.texto,
      color: colores.error,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: espaciados.medio,
      borderBottomWidth: 0.5,
      borderColor: colores.bordeSuave,
    },

    headerCodigo: {
      ...tipografia.tituloPantalla,
      color: colores.texto,
    },

    contenido: {
      padding: espaciados.medio,
    },

    titulo: {
      ...tipografia.titulo,
      fontSize: 17,
      fontWeight: pesosFuente.medio,
      color: colores.texto,
      marginBottom: espaciados.xs,
    },

    badge: {
      alignSelf: "flex-start",
      borderRadius: radios.pequeno,
      paddingVertical: 5,
      paddingHorizontal: espaciados.medio,
      marginBottom: espaciados.pequeno,
    },

    badgeTexto: {
      // ...tipografia.textoPequeno,
      // fontWeight: pesosFuente.medio,
      /* borderWidth: 1,
          borderColor: colores.borde,
          borderRadius: radios.redondo,
          paddingVertical: 10,
          paddingHorizontal: espaciados.grande,*/
      ...tipografia.textoSecundario,
      fontWeight: pesosFuente.seminegrita,
    },

    filaAdhesiones: {
      flexDirection: "row",
      alignItems: "center",
      gap: espaciados.xs,
      marginBottom: espaciados.medio,
    },

    textoAdhesiones: {
      ...tipografia.textoPequeno,
      color: colores.textoSecundario,
    },

    cajaMotivo: {
      backgroundColor: colores.superficie,
      borderRadius: radios.pequeno,
      padding: espaciados.medio,
      marginBottom: espaciados.medio,
    },

    cajaMotivoTitulo: {
      ...tipografia.textoPequeno,
      fontWeight: pesosFuente.medio,
      color: colores.error,
      marginBottom: espaciados.xs,
    },

    cajaMotivoTexto: {
      ...tipografia.textoSecundario,
      color: colores.error,
    },

    foto: {
      width: "100%",
      height: 180,
      borderRadius: radios.pequeno,
      backgroundColor: colores.superficie,
      marginBottom: espaciados.medio,
    },

    descripcion: {
      ...tipografia.textoSecundario,
      color: colores.texto,
      marginBottom: espaciados.medio,
    },

    botonAudio: {
      flexDirection: "row",
      alignItems: "center",
      gap: espaciados.pequeno,
      borderWidth: 0.5,
      borderColor: colores.borde,
      borderRadius: radios.pequeno,
      padding: espaciados.pequeno,
      marginBottom: espaciados.medio,
    },

    botonAudioTexto: {
      ...tipografia.textoSecundario,
      color: colores.primario,
    },

    bloqueArreglo: {
      marginBottom: espaciados.medio,
    },

    subtitulo: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
      marginBottom: espaciados.pequeno,
    },

    timeline: {
      gap: espaciados.medio,
    },

    timelineItem: {
      flexDirection: "row",
      gap: espaciados.pequeno,
    },

    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colores.textoSuave,
      marginTop: 5,
    },

    timelineDotActivo: {
      backgroundColor: colores.advertencia,
    },

    timelineFecha: {
      ...tipografia.textoPequeno,
      color: colores.textoSuave,
    },

    timelineEstado: {
      ...tipografia.textoSecundario,
      color: colores.texto,
    },

    timelineComentario: {
      ...tipografia.textoPequeno,
      color: colores.textoSecundario,
      marginTop: 2,
    },

    fondoModal: {
      flex: 1,
      backgroundColor: colores.fondoModal,
      alignItems: "center",
      justifyContent: "center",
    },

    tarjetaQR: {
      backgroundColor: colores.superficie,
      borderRadius: radios.grande,
      padding: espaciados.muyGrande,
      alignItems: "center",
      gap: espaciados.pequeno,
    },

    textoQR: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.texto,
      marginTop: espaciados.xs,
    },

    subtextoQR: {
      ...tipografia.textoPequeno,
      color: colores.textoSuave,
    },

  });
};