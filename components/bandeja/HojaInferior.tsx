import Ionicons from "@react-native-vector-icons/ionicons";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { espaciados, obtenerColores, radios, tipografia } from "@/styles/theme";

type Props = {
  visible: boolean;
  titulo: string;
  subtitulo?: string;
  onCerrar: () => void;
  children: ReactNode;
};

// Panel que sube desde abajo. Lo reutilizan todas las acciones de la bandeja.
export function HojaInferior({ visible, titulo, subtitulo, onCerrar, children }: Props) {
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
        <KeyboardAvoidingView
          style={styles.contenedor}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        {/* Tocar afuera cierra el panel */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} />

        <View style={styles.hoja}>
          <View style={styles.encabezado}>
            <View style={styles.textos}>
              <Text style={styles.titulo}>{titulo}</Text>
              {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
            </View>
            <Pressable onPress={onCerrar} hitSlop={8} accessibilityLabel="Cerrar">
              <Ionicons name="close" size={26} color={colores.texto} />
            </Pressable>
          </View>

          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const crearStyles = (tema: "light" | "dark") => {
  const colores = obtenerColores(tema);

  return StyleSheet.create({
    contenedor: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colores.fondoModal,
    },
    hoja: {
      backgroundColor: colores.fondo,
      borderTopLeftRadius: radios.grande,
      borderTopRightRadius: radios.grande,
      padding: espaciados.extraGrande,
      maxHeight: "80%",
      gap: espaciados.grande,
    },
    encabezado: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: espaciados.medio,
    },
    textos: { flex: 1, gap: espaciados.xs },
    titulo: { ...tipografia.titulo, color: colores.texto },
    subtitulo: { ...tipografia.textoSecundario, color: colores.textoSecundario },
  });
};