import Ionicons from "@react-native-vector-icons/ionicons";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import {
    espaciados,
    obtenerColores,
    pesosFuente,
    radios,
    tipografia,
} from "../../styles/theme";

export function TarjetaUbicacion() {
  const colorScheme = useColorScheme();
  const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>¿Dónde?</Text>
      <View style={styles.tarjetaUbicacion}>
        <View style={styles.filaDireccion}>
          <Ionicons name="location-outline" size={20} color={colores.texto} />
          <View>
            <Text style={styles.direccionTexto}>Rocamora 1240</Text>
            <Text style={styles.distanciaTexto}>A 12 m de tu ubicacion</Text>
          </View>
        </View>
        <View style={styles.mapaPlaceholder}>
          <Ionicons
            name="map-outline"
            size={28}
            color={colores.textoSecundario}
          />
        </View>
      </View>
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
    tarjetaUbicacion: {
      backgroundColor: colores.superficie,
      borderRadius: radios.medio,
      padding: espaciados.grande,
    },
    filaDireccion: {
      flexDirection: "row",
      alignItems: "center",
      gap: espaciados.pequeno,
      marginBottom: espaciados.medio,
    },
    direccionTexto: {
      ...tipografia.texto,
      fontWeight: pesosFuente.negrita,
      color: colores.texto,
    },
    distanciaTexto: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
    },
    mapaPlaceholder: {
      height: 130,
      borderRadius: radios.pequeno,
      borderWidth: 1,
      borderColor: colores.bordeSuave,
      alignItems: "center",
      justifyContent: "center",
    },
  });
};
