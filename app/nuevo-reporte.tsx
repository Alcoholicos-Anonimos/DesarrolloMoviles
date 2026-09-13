import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { reportesService } from "../services/reporte";
import { TipoDeReporte } from "../tipos";

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
          <Ionicons name="arrow-back" size={24} color="white" />
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
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={styles.botonGrandeText}>Tomar foto</Text>
            </Pressable>
            <Pressable style={styles.botonGrande}>
              <Ionicons name="images-outline" size={24} color="white" />
              <Text style={styles.botonGrandeText}>Galeria</Text>
            </Pressable>
          </View>
        </View>

        {/* DONDE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Dónde?</Text>
          <View style={styles.tarjetaUbicacion}>
            <View style={styles.filaDireccion}>
              <Ionicons name="location-outline" size={20} color="white" />
              <View>
                <Text style={styles.direccionTexto}>Rocamora 1240</Text>
                <Text style={styles.distanciaTexto}>
                  A 12 m de tu ubicacion
                </Text>
              </View>
            </View>
            <View style={styles.mapaPlaceholder}>
              <Ionicons name="map-outline" size={28} color="#666" />
            </View>
          </View>
        </View>

        {/* CONTANOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contanos</Text>
          <View style={styles.filaBotonesGrandes}>
            <Pressable style={styles.botonContanos}>
              <Ionicons name="pencil-outline" size={18} color="white" />
              <Text style={styles.botonGrandeText}>Escribir</Text>
            </Pressable>
            <Pressable style={styles.botonContanos}>
              <Ionicons name="mic-outline" size={18} color="white" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  chipSeleccionado: {
    backgroundColor: "#3a1414",
    borderColor: "#c0392b",
  },
  chipText: {
    color: "white",
  },
  chipTextSeleccionado: {
    color: "#e74c3c",
  },
  filaBotonesGrandes: {
    flexDirection: "row",
    gap: 10,
  },
  botonGrande: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  botonContanos: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 20,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  botonGrandeText: {
    color: "white",
  },
  tarjetaUbicacion: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
  },
  filaDireccion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  direccionTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  distanciaTexto: {
    color: "#888",
    fontSize: 13,
  },
  mapaPlaceholder: {
    height: 130,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  botonEnviar: {
    backgroundColor: "white",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  botonEnviarText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
});
