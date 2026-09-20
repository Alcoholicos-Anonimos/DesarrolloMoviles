import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { reportesService } from "../src/servicios/reportes";
import { CambioDeEstado, EstadoReporte, Reporte, TipoDeReporte } from "../src/tipos";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const ETIQUETA_ESTADO: Record<EstadoReporte, string> = {
  recibido: "Recibido",
  en_revision: "En revisión",
  asignado: "Asignado a cuadrilla",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
};

const COLOR_ESTADO: Record<EstadoReporte, { fondo: string; texto: string }> = {
  recibido: { fondo: "#e6f1fb", texto: "#0C447C" },
  en_revision: { fondo: "#faeeda", texto: "#633806" },
  asignado: { fondo: "#faeeda", texto: "#633806" },
  resuelto: { fondo: "#eaf3de", texto: "#27500a" },
  rechazado: { fondo: "#fcebeb", texto: "#791f1f" },
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

export default function DetalleReporte(){
  const colorScheme = useColorScheme();

  const styles = crearStyles(colorScheme ?? 'light'); //Creamos el estilo segun el color del modo del dispositivo 
  const { id } = useLocalSearchParams<{ id: string }>();

  const [reporte, setReporte] = useState<Reporte | null>(null);
  const [cambios, setCambios] = useState<CambioDeEstado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarQR, setMostrarQR] = useState(false); 

  
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

  const colorEstado = COLOR_ESTADO[reporte.estado];
  const fotoProblema = reporte.fotos.find((f) => f.momento === "problema");
  const fotoArreglo = reporte.fotos.find((f) => f.momento === "arreglo");

  // El motivo de rechazo vive en el último cambio de estado a "rechazado".
  const motivoRechazo =
    reporte.estado === "rechazado"
      ? [...cambios].reverse().find((c) => c.estado === "rechazado")?.comentario
      : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back-outline" size={22} />
        </Pressable>
        <Text style={styles.headerCodigo}>{reporte.codigo}</Text>
        <Pressable onPress={() => setMostrarQR(true)} hitSlop={12}>
          <Ionicons name="qr-code-outline" size={22} />
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
            <Ionicons name="people-outline" size={14} color="#5f5e5a" />
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
          <Pressable style={styles.botonAudio}>
            <Ionicons name="play-circle-outline" size={20} color="#26215c" />
            <Text style={styles.botonAudioTexto}>Escuchar nota de voz</Text>
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
              source={{ uri: urlQR(reporte.codigo) }}
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

const crearStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'light' ? '#ffffffff' : '#000000',
    paddingHorizontal: 20,
  },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  textoError: { fontSize: 14, color: "#791F1F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderBottomWidth: 0.5,
    borderColor:  colorScheme === 'light' ? '#ffffffff' : '#000000',
  },
  headerCodigo: { fontSize: 14, fontWeight: "500" },
  contenido: { padding: 14 },
  titulo: { fontSize: 17, fontWeight: "500", marginBottom: 6 },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  badgeTexto: { fontSize: 12, fontWeight: "500" },
  filaAdhesiones: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  textoAdhesiones: { fontSize: 12, color: "#5f5e5a" },
  cajaMotivo: {
    backgroundColor:  colorScheme === 'light' ? '#ffffffff' : '#000000',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  cajaMotivoTitulo: {
    fontSize: 12,
    fontWeight: "500",
    color: "#791f1f",
    marginBottom: 4,
  },
  cajaMotivoTexto: { fontSize: 13, color: "#791f1f" },
  foto: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    backgroundColor:  colorScheme === 'light' ? '#ffffffff' : '#000000',
    marginBottom: 14,
  },
  descripcion: { fontSize: 13, color:  colorScheme === 'light' ? '#ffffffff' : '#000000', marginBottom: 14 },
  botonAudio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 0.5,
    borderColor:  colorScheme === 'light' ? '#ffffffff' : '#000000',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  botonAudioTexto: { fontSize: 13, color: "#26215c" },
  bloqueArreglo: { marginBottom: 14 },
  subtitulo: { fontSize: 13, color: "#5f5e5a", marginBottom: 10 },
  timeline: { gap: 12 },
  timelineItem: { flexDirection: "row", gap: 10 },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#888780",
    marginTop: 5,
  },
  timelineDotActivo: { backgroundColor: "#854F0B" },
  timelineFecha: { fontSize: 12, color: "#888780" },
  timelineEstado: { fontSize: 13 },
  timelineComentario: { fontSize: 12, color: "#5f5e5a", marginTop: 2 },
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  tarjetaQR: {
    backgroundColor:  colorScheme === 'light' ? '#ffffffff' : '#000000',
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  textoQR: { fontSize: 15, fontWeight: "500", marginTop: 4 },
  subtextoQR: { fontSize: 12, color: "#888780" },
});
