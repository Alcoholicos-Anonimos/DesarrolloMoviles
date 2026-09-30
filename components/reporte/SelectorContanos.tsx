import Ionicons from "@react-native-vector-icons/ionicons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import {
  espaciados,
  obtenerColores,
  radios,
  tipografia,
} from "../../styles/theme";

type Modo = "escribir" | "audio" | null;

type Props = {
  descripcion: string;
  onDescripcionChange: (texto: string) => void;
  audioUri: string | null;
  onAudioChange: (uri: string | null) => void;
};

export function SelectorContanos({
  descripcion,
  onDescripcionChange,
  audioUri,
  onAudioChange,
}: Props) {
  const [modo, setModo] = useState<Modo>(null);

  const colorScheme = useColorScheme();
  const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  const grabador = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const estadoGrabador = useAudioRecorderState(grabador);

  // El reproductor necesita una fuente; si todavía no hay audio, le pasamos null.
  const reproductor = useAudioPlayer(audioUri ?? null);
  const estadoReproductor = useAudioPlayerStatus(reproductor);

  useEffect(() => {
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
  }, []);

  const elegirModo = (nuevoModo: Modo) => {
    if (nuevoModo === "escribir") {
      onAudioChange(null);
    } else {
      onDescripcionChange("");
    }
    setModo(nuevoModo);
  };

  const alternarGrabacion = async () => {
    if (estadoGrabador.isRecording) {
      await grabador.stop();
      onAudioChange(grabador.uri);
      return;
    }

    const permiso = await AudioModule.requestRecordingPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso al micrófono para grabar.",
      );
      return;
    }

    await grabador.prepareToRecordAsync();
    grabador.record();
  };

  const alternarReproduccion = () => {
    if (estadoReproductor.playing) {
      reproductor.pause();
    } else {
      reproductor.seekTo(0);
      reproductor.play();
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contanos</Text>

      <View style={styles.filaBotonesGrandes}>
        <Pressable
          style={[
            styles.botonContanos,
            modo === "escribir" && styles.botonActivo,
          ]}
          onPress={() => elegirModo("escribir")}
        >
          <Ionicons name="pencil-outline" size={18} color={colores.texto} />
          <Text style={styles.botonGrandeText}>Escribir</Text>
        </Pressable>
        <Pressable
          style={[styles.botonContanos, modo === "audio" && styles.botonActivo]}
          onPress={() => elegirModo("audio")}
        >
          <Ionicons name="mic-outline" size={18} color={colores.texto} />
          <Text style={styles.botonGrandeText}>Grabar audio</Text>
        </Pressable>
      </View>

      {modo === "escribir" && (
        <View>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            placeholder="Describí el problema..."
            placeholderTextColor={colores.textoSecundario}
            value={descripcion}
            onChangeText={onDescripcionChange}
          />
          <Pressable style={styles.botonListo} onPress={Keyboard.dismiss}>
            <Text style={styles.textoListo}>Listo</Text>
          </Pressable>
        </View>
      )}

      {modo === "audio" && (
        <View style={styles.contenedorAudio}>
          {!audioUri ? (
            <>
              <Pressable
                style={[
                  styles.botonGrabar,
                  estadoGrabador.isRecording && styles.botonGrabarActivo,
                ]}
                onPress={alternarGrabacion}
              >
                <Ionicons
                  name={
                    estadoGrabador.isRecording ? "stop-circle" : "mic-circle"
                  }
                  size={48}
                  color={
                    estadoGrabador.isRecording
                      ? colores.peligro
                      : colores.primario
                  }
                />
              </Pressable>
              <Text style={styles.textoAviso}>
                {estadoGrabador.isRecording
                  ? "Grabando... tocá para detener"
                  : "Tocá para grabar"}
              </Text>
            </>
          ) : (
            <>
              <Pressable
                style={styles.botonGrabar}
                onPress={alternarReproduccion}
              >
                <Ionicons
                  name={
                    estadoReproductor.playing ? "pause-circle" : "play-circle"
                  }
                  size={48}
                  color={colores.primario}
                />
              </Pressable>
              <Text style={styles.textoAviso}>Nota de voz lista</Text>
              <Pressable onPress={() => onAudioChange(null)}>
                <Text style={styles.textoRegrabar}>Grabar de nuevo</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({
    section: {
      marginTop: espaciados.grande,
    },
    sectionTitle: {
      ...tipografia.tituloSeccion,
      color: colores.texto,
      marginBottom: espaciados.medio,
    },
    filaBotonesGrandes: {
      flexDirection: "row",
      gap: espaciados.pequeno,
    },
    botonContanos: {
      flex: 1,
      flexDirection: "row",
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.redondo,
      paddingVertical: espaciados.medio,
      justifyContent: "center",
      alignItems: "center",
      gap: espaciados.pequeno,
    },
    botonActivo: {
      backgroundColor: colores.superficie,
      borderColor: colores.primario,
    },
    botonGrandeText: {
      ...tipografia.texto,
      color: colores.texto,
    },
    input: {
      ...tipografia.texto,
      color: colores.texto,
      backgroundColor: colores.superficie,
      borderRadius: radios.medio,
      padding: espaciados.grande,
      marginTop: espaciados.medio,
      minHeight: 100,
      textAlignVertical: "top",
    },
    botonListo: {
      alignSelf: "flex-end",
      paddingVertical: espaciados.pequeno,
      paddingHorizontal: espaciados.medio,
    },
    textoListo: {
      ...tipografia.texto,
      color: colores.primario,
      fontWeight: "600",
    },
    contenedorAudio: {
      alignItems: "center",
      marginTop: espaciados.medio,
      padding: espaciados.grande,
      backgroundColor: colores.superficie,
      borderRadius: radios.medio,
    },
    botonGrabar: {
      marginBottom: espaciados.pequeno,
    },
    botonGrabarActivo: {
      opacity: 0.8,
    },
    textoAviso: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
      marginTop: espaciados.medio,
    },
    textoRegrabar: {
      ...tipografia.textoSecundario,
      color: colores.enlace,
      marginTop: espaciados.pequeno,
    },
  });
};
