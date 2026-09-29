import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/contexto/AuthContext";
import {
  obtenerColores,
  espaciados,
  radios,
  tipografia,
  pesosFuente,
} from "@/styles/theme";

// PROVISORIA: solo para probar la navegación por rol
export default function BandejaScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const styles = crearStyles(tema);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Bandeja</Text>
      <Text style={styles.texto}>Hola, {usuario?.nombre}</Text>

      <Pressable style={styles.boton} onPress={cerrarSesion}>
        <Text style={styles.textoBoton}>Cerrar sesión</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.fondo,
      padding: espaciados.extraGrande,
      gap: espaciados.grande,
    },
    titulo: { ...tipografia.tituloPantalla, color: colores.texto },
    texto: { ...tipografia.texto, color: colores.textoSecundario },
    boton: {
      backgroundColor: colores.primario,
      borderRadius: radios.redondo,
      paddingVertical: espaciados.medio,
      alignItems: "center",
    },
    textoBoton: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.blanco,
    },
  });
};