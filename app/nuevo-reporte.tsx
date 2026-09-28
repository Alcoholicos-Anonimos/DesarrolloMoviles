import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SelectorFoto } from "../components/reporte/SelectorFoto";
import { SelectorTipoProblema } from "../components/reporte/SelectorTipoProblema";
import { TarjetaUbicacion } from "../components/reporte/TarjetaUbicacion";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tipografia,
} from "../styles/theme";

export default function NuevoReporte() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("tip-bache");
  const [foto, setFoto] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colores.texto} />
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo reporte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SelectorTipoProblema
          tipoSeleccionado={tipoSeleccionado}
          onSeleccionar={setTipoSeleccionado}
        />

        <SelectorFoto foto={foto} onFotoChange={setFoto} />

        <TarjetaUbicacion />

        {/* CONTANOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contanos</Text>
          <View style={styles.filaBotonesGrandes}>
            <Pressable style={styles.botonContanos}>
              <Ionicons name="pencil-outline" size={18} color={colores.texto} />
              <Text style={styles.botonGrandeText}>Escribir</Text>
            </Pressable>
            <Pressable style={styles.botonContanos}>
              <Ionicons name="mic-outline" size={18} color={colores.texto} />
              <Text style={styles.botonGrandeText}>Grabar audio</Text>
            </Pressable>
          </View>
        </View>

        {/* ENVIAR */}
        <Pressable style={styles.botonEnviar}>
          <Text style={styles.botonEnviarText}>Enviar</Text>
        </Pressable>
      </ScrollView>
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
    botonGrandeText: {
      ...tipografia.texto,
      color: colores.texto,
    },
    botonEnviar: {
      backgroundColor: colores.texto,
      borderRadius: radios.redondo,
      paddingVertical: espaciados.grande,
      alignItems: "center",
      marginTop: espaciados.muyGrande,
    },
    botonEnviarText: {
      ...tipografia.texto,
      fontWeight: pesosFuente.negrita,
      color: colores.fondo,
    },
  });
};
