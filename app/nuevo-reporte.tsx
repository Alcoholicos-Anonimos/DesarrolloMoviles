import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { reportesService } from "../src/servicios/reportes";
import { TipoDeReporte } from "../src/tipos";
import { obtenerColores, espaciados, radios, tipografia, pesosFuente } from "../styles/theme";

export default function NuevoReporte() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("tip-bache");
  const [tiposDisponibles, setTiposDisponibles] = useState<TipoDeReporte[]>([]);

  useEffect(() => {
    reportesService.obtenerTipos().then((tipos) => {
      setTiposDisponibles(tipos);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color= {colores.texto} />
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo reporte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* QUE PASA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qué pasa?</Text>
          <View style={styles.chipsContainer}>
            {tiposDisponibles.map((tipo) => {
              const estaSeleccionado = tipo.id === tipoSeleccionado;
              return (
                <Pressable
                  key={tipo.id}
                  onPress={() => setTipoSeleccionado(tipo.id)}
                  style={[
                    styles.chip,
                    estaSeleccionado && styles.chipSeleccionado,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      estaSeleccionado && styles.chipTextSeleccionado,
                    ]}
                  >
                    {tipo.nombre}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* FOTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto (obligatoria)</Text>
          <View style={styles.filaBotonesGrandes}>
            <Pressable style={styles.botonGrande}>
              <Ionicons name="camera-outline" size={24} color={colores.texto} />
              <Text style={styles.botonGrandeText}>Tomar foto</Text>
            </Pressable>
            <Pressable style={styles.botonGrande}>
              <Ionicons name="images-outline" size={24} color={colores.texto} />
              <Text style={styles.botonGrandeText}>Galeria</Text>
            </Pressable>
          </View>
        </View>

        {/* DONDE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Dónde?</Text>
          <View style={styles.tarjetaUbicacion}>
            <View style={styles.filaDireccion}>
              <Ionicons name="location-outline" size={20} color={colores.texto} />
              <View>
                <Text style={styles.direccionTexto}>Rocamora 1240</Text>
                <Text style={styles.distanciaTexto}>
                  A 12 m de tu ubicacion
                </Text>
              </View>
            </View>
            <View style={styles.mapaPlaceholder}>
              <Ionicons name="map-outline" size={28} color={colores.textoSecundario} />
            </View>
          </View>
        </View>

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

const colorScheme = useColorScheme();

const colores = obtenerColores(
  colorScheme === "dark" ? "dark" : "light"
);

const styles = StyleSheet.create({

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

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciados.pequeno,
  },

  chip: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.redondo,
    paddingVertical: 10,
    paddingHorizontal: espaciados.grande,
  },

  chipSeleccionado: {
    backgroundColor: colores.peligroSuave,
    borderColor: colores.peligro,
  },

  chipText: {
    ...tipografia.texto,
    color: colores.texto,
  },

  chipTextSeleccionado: {
    ...tipografia.texto,
    color: colores.textoPeligro,
  },

  filaBotonesGrandes: {
    flexDirection: "row",
    gap: espaciados.pequeno,
  },

  botonGrande: {
    flex: 1,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.medio,
    paddingVertical: espaciados.muyGrande,
    alignItems: "center",
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