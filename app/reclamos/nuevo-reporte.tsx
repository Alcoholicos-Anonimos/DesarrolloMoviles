import Ionicons from "@react-native-vector-icons/ionicons";
import * as Network from "expo-network";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectorContanos } from "../../components/reporte/SelectorContanos";
import { SelectorFoto } from "../../components/reporte/SelectorFoto";
import { SelectorTipoProblema } from "../../components/reporte/SelectorTipoProblema";
import { TarjetaUbicacion } from "../../components/reporte/TarjetaUbicacion";
import { guardarArchivosDelReporte } from "../../src/servicios/archivos";
import { guardarReportePendiente } from "../../src/servicios/colaOffline";
import { reportesService } from "../../src/servicios/reportes";
import { Coordenadas, NuevoReporteInput } from "../../src/tipos";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tipografia,
} from "../../styles/theme";

export default function NuevoReporte() {
  // Si llegamos desde el mapa tocando un punto, las coordenadas vienen por params
  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const la = Number(lat);
  const lo = Number(lng);
  const coordenadaInicial: Coordenadas | null =
    lat !== undefined && lng !== undefined && Number.isFinite(la) && Number.isFinite(lo)
      ? { latitud: la, longitud: lo }
      : null;
  
  const [tipoSeleccionado, setTipoSeleccionado] = useState("tip-bache");
  const [fotos, setFotos] = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(coordenadaInicial);
  const [direccion, setDireccion] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const colorScheme = useColorScheme();
  const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  //Vane metio dedo y lo corrige (:'D)  --> Esto evita que las referencias de las funciones cambien en cada render.
  const cambiarUbicacion = useCallback((coordenada: Coordenadas | null) => {
    setUbicacion(coordenada);
  }, []);
 const cambiarDireccion = useCallback((valor: string | null) => {
    setDireccion(valor);
  }, []);
  // Al tocar el campo de texto, esperamos a que el teclado termine de abrirse
  // y bajamos el scroll para que el campo quede a la vista.
  const alEnfocarTexto = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };

  const validarYArmarReporte = (): NuevoReporteInput | null => {
    if (fotos.length === 0) {
      Alert.alert("Falta la foto", "Sacá o elegí una foto antes de enviar.");
      return null;
    }

    if (!ubicacion) {
      Alert.alert(
        "Falta la ubicación",
        "Todavía no tenemos la ubicación. Esperá un momento o, si no cargó, tocá el mapa para marcar dónde está el problema.",
      );
      return null;
    }

    if (!descripcion && !audioUri) {
      Alert.alert(
        "Falta contarnos qué pasa",
        "Escribí una descripción o grabá una nota de voz.",
      );
      return null;
    }

    const input: NuevoReporteInput = {
      id: `rep-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      tipoId: tipoSeleccionado,
      descripcion: descripcion || null,
      audioUrl: audioUri,
      fotos: fotos.map((uri, indice) => ({
        id: `foto-${Date.now()}-${indice}`,
        url: uri,
        momento: "problema",
      })),
      coordenadas: ubicacion,
      direccion:
        direccion ??
        `${ubicacion.latitud.toFixed(5)}, ${ubicacion.longitud.toFixed(5)}`,
      creadoEn: new Date().toISOString(),
    };

    return input;
  };

  const alEnviar = async () => {
    const inputBase = validarYArmarReporte();
    if (!inputBase) return;

    setEnviando(true);
    let input = inputBase;
    try {
      // Antes de hacer nada más, pasamos fotos y audio de la caché a la carpeta permanente.
      input = guardarArchivosDelReporte(inputBase);

      const estadoRed = await Network.getNetworkStateAsync();

      if (!estadoRed.isConnected) {
        await guardarReportePendiente(input);
        Alert.alert(
          "Reporte guardado",
          "No hay conexión ahora. Se va a enviar solo cuando vuelva la señal.",
          [{ text: "Aceptar", onPress: () => router.back() }],
        );
        return;
      }

      const respuesta = await reportesService.crearReporte(input);
      Alert.alert(
        "Reporte enviado",
        `Tu número de seguimiento es ${respuesta.datos.codigo}`,
        [{ text: "Aceptar", onPress: () => router.back() }],
      );
    } catch {
      // Si falla igual habiendo conexión (por ejemplo, el servidor no responde),
      // lo guardamos para reintentar más tarde en vez de perderlo.
      await guardarReportePendiente(input);
      Alert.alert(
        "No se pudo enviar ahora",
        "Guardamos tu reporte y lo vamos a reintentar automáticamente.",
        [{ text: "Aceptar", onPress: () => router.back() }],
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colores.texto} />
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo reporte</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <SelectorTipoProblema
            tipoSeleccionado={tipoSeleccionado}
            onSeleccionar={setTipoSeleccionado}
          />

          <SelectorFoto fotos={fotos} onFotosChange={setFotos} />

          <TarjetaUbicacion
            ubicacion={ubicacion}
            ubicacionInicial={coordenadaInicial}
            onUbicacionChange={cambiarUbicacion}
            onDireccionChange={cambiarDireccion}
          />

          <SelectorContanos
            descripcion={descripcion}
            onDescripcionChange={setDescripcion}
            audioUri={audioUri}
            onAudioChange={setAudioUri}
            onTextoFocus={alEnfocarTexto}
          />

          <Pressable
            style={[
              styles.botonEnviar,
              enviando && styles.botonEnviarDeshabilitado,
            ]}
            onPress={alEnviar}
            disabled={enviando}
          >
            <Text style={styles.botonEnviarText}>
              {enviando ? "Enviando..." : "Enviar"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: espaciados.grande,
      gap: espaciados.grande,
    },
    headerTitle: {
      ...tipografia.titulo,
      color: colores.texto,
    },
    scrollContent: {
      paddingHorizontal: espaciados.grande,
      paddingBottom: espaciados.enorme,
    },
    section: {
      marginTop: espaciados.grande,
    },
    sectionTitle: {
      ...tipografia.tituloSeccion,
      color: colores.texto,
      marginBottom: espaciados.medio,
    },
    botonEnviar: {
      backgroundColor: colores.texto,
      borderRadius: radios.redondo,
      paddingVertical: espaciados.grande,
      alignItems: "center",
      marginTop: espaciados.muyGrande,
    },
    botonEnviarDeshabilitado: {
      opacity: 0.6,
    },
    botonEnviarText: {
      ...tipografia.texto,
      fontWeight: pesosFuente.negrita,
      color: colores.fondo,
    },
  });
};
