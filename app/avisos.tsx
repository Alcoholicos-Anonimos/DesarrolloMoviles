import Ionicons from "@react-native-vector-icons/ionicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/contexto/AuthContext";
import { pedirPermiso, tengoPermiso } from "@/src/servicios/avisos";
import {
  avisosActivosDe,
  guardarAvisosActivos,
} from "@/src/servicios/preferenciasAvisos";
import { espaciados, obtenerColores, radios, tipografia } from "@/styles/theme";

export default function AvisosScreen() {
  const { usuario } = useAuth();
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);

  const [activos, setActivos] = useState(false);

  // Se ve "activado" solo si el vecino lo quiere Y el sistema nos dejó
  useEffect(() => {
    if (!usuario) return;
    Promise.all([avisosActivosDe(usuario.id), tengoPermiso()]).then(
      ([quiere, permiso]) => setActivos(quiere && permiso),
    );
  }, [usuario]);

  const alCambiar = async (quiere: boolean) => {
    if (!usuario) return;

    if (quiere) {
      const hayPermiso = await pedirPermiso();
      if (!hayPermiso) {
        Alert.alert(
          "Necesitamos tu permiso",
          "Para avisarte cuando cambie tu reclamo, activá las notificaciones en la configuración del teléfono.",
          [
            { text: "Ahora no", style: "cancel" },
            { text: "Abrir configuración", onPress: () => Linking.openSettings() },
          ],
        );
        return; // el interruptor queda apagado
      }
    }

    setActivos(quiere);
    await guardarAvisosActivos(usuario.id, quiere);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colores.texto} />
        </Pressable>
        <Text style={styles.titulo}>Avisos</Text>
      </View>

      <View style={styles.fila}>
        <View style={styles.textos}>
          <Text style={styles.filaTitulo}>Avisarme de mis reclamos</Text>
          <Text style={styles.ayuda}>
            Te avisamos cuando cambia el estado de un reclamo tuyo o cuando otro
            vecino se suma.
          </Text>
        </View>
        <Switch
          value={activos}
          onValueChange={alCambiar}
          accessibilityLabel="Activar avisos"
        />
      </View>
    </SafeAreaView>
  );
}

const crearStyles = (tema: "light" | "dark") => {
  const colores = obtenerColores(tema);
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.fondo,
      paddingHorizontal: espaciados.extraGrande,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: espaciados.medio,
      paddingVertical: espaciados.grande,
    },
    titulo: { ...tipografia.tituloPantalla, color: colores.texto },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colores.superficie,
      borderRadius: radios.medio,
      padding: espaciados.grande,
    },
    textos: { flex: 1, paddingRight: espaciados.medio },
    filaTitulo: { ...tipografia.texto, color: colores.texto, fontWeight: "600" },
    ayuda: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
      marginTop: espaciados.xs,
    },
  });
};