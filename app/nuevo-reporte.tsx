import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TIPOS_PROBLEMA = ["Bache", "Luz", "Basura", "Rama", "Agua", "Otro"];

export default function NuevoReporte() {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Bache");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text style={styles.headerTitle}>Nuevo Reporte</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Qué pasa?</Text>

        <View style={styles.chipsContainer}>
          {TIPOS_PROBLEMA.map((tipo) => {
            const estaSeleccionado = tipo === tipoSeleccionado;
            return (
              <Pressable
                key={tipo}
                onPress={() => setTipoSeleccionado(tipo)}
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
                  {tipo}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
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
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
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
});
