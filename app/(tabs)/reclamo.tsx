import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@react-native-vector-icons/ionicons";
import {
  obtenerColores,
  espaciados,
  radios,
  tipografia,
  pesosFuente,
  obtenerColoresEstado,
} from "../../styles/theme";
import { Reporte, TipoDeReporte, EstadoReporte } from "../../src/tipos";
import { reportesService } from "../../src/servicios/reportes";
import { router } from "expo-router";
import { Link } from "expo-router";
import { useAuth } from "@/src/contexto/AuthContext";
// Función auxiliar para mapear el color y texto según el estado
const obtenerInfoEstado = (estado: EstadoReporte) => {
  switch (estado) {
    case "asignado":
      return {
        label: "Asignado",
        color: coloresEstado.asignado.texto,
        fondo: coloresEstado.asignado.fondo,
      };

    case "resuelto":
      return {
        label: "Resuelto",
        color: coloresEstado.resuelto.texto,
        fondo: coloresEstado.resuelto.fondo,
      };

    case "rechazado":
      return {
        label: "Rechazado",
        color: coloresEstado.rechazado.texto,
        fondo: coloresEstado.rechazado.fondo,
      };

    case "en_revision":
      return {
        label: "En revisión",
        color: coloresEstado.en_revision.texto,
        fondo: coloresEstado.en_revision.fondo,
      };

    case "recibido":
      return {
        label: "Recibido",
        color: coloresEstado.recibido.texto,
        fondo: coloresEstado.recibido.fondo,
      };
  }
};

export default function ReclamoScreen() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [tipos, setTipos] = useState<TipoDeReporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const { cerrarSesion } = useAuth();

  const confirmarCerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Querés salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: cerrarSesion },
    ]);
  };

  // Carga asíncrona desde la capa de servicios
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [respReportes, respTipos] = await Promise.all([
          reportesService.obtenerMisReportes(),
          reportesService.obtenerTipos(),
        ]);
        setReportes(respReportes.datos);
        setTipos(respTipos);
      } catch (error) {
        console.error("Error al cargar los reclamos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para obtener el tipo de reporte vinculado
  const obtenerTipo = (tipoId: string) => {
    return tipos.find((t) => t.id === tipoId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado: Título y botón + */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis reclamos</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: espaciados.pequeno,
          }}
        >
          <Pressable
            onPress={confirmarCerrarSesion}
            style={({ pressed }) => [
              styles.botonAgregar,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={26} color={colores.texto} />
          </Pressable>

          <Link href="/nuevo-reporte" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.botonAgregar,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Ionicons name="add" size={28} color={colores.texto} />
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Indicador de carga si la API / mock está respondiendo */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaContainer}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          renderItem={({ item }) => {
            const tipoInfo = obtenerTipo(item.tipoId);
            const estadoInfo = obtenerInfoEstado(item.estado);

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.itemRow,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/[id]",
                    params: { id: item.id },
                  })
                }
              >
                {/* Ícono dentro de cajita redondeada */}
                <View style={styles.iconoBox}>
                  <Ionicons
                    name={(tipoInfo?.icono as any) || "help-outline"}
                    size={22}
                    color={tipoInfo?.color || colores.blanco}
                  />
                </View>

                {/* Datos centrales: Título y Código */}
                <View style={styles.infoCentral}>
                  <Text style={styles.textoPrincipal} numberOfLines={1}>
                    {tipoInfo?.nombre || "Reclamo"} - {item.direccion}
                  </Text>
                  <Text style={styles.textoCodigo}>{item.codigo}</Text>
                </View>

                {/* Badge / Etiqueta de estado a la derecha */}
                <View
                  style={[
                    styles.badgeEstado,
                    {
                      backgroundColor: estadoInfo.fondo,
                      borderColor: estadoInfo.color + "40",
                    },
                  ]}
                >
                  <Text
                    style={[styles.textoBadge, { color: estadoInfo.color }]}
                  >
                    {estadoInfo.label}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const colorScheme = useColorScheme();

const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
const coloresEstado = obtenerColoresEstado(
  colorScheme === "dark" ? "dark" : "light",
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colores.fondo,
    paddingHorizontal: espaciados.extraGrande,
  },

  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: espaciados.grande,
  },

  titulo: {
    ...tipografia.tituloPantalla,
    color: colores.texto,
  },

  botonAgregar: {
    padding: espaciados.pequeno,
  },

  listaContainer: {
    paddingTop: espaciados.pequeno,
  },

  separador: {
    height: 1,
    backgroundColor: colores.bordeSuave,
    marginVertical: espaciados.xs,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: espaciados.medio,
  },

  iconoBox: {
    width: 44,
    height: 44,
    borderRadius: radios.medio,
    backgroundColor: colores.superficie,
    justifyContent: "center",
    alignItems: "center",
    marginRight: espaciados.medio,
  },

  infoCentral: {
    flex: 1,
    justifyContent: "center",
  },

  textoPrincipal: {
    ...tipografia.texto,
    color: colores.texto,
    fontWeight: pesosFuente.seminegrita,
    marginBottom: espaciados.xs,
  },

  textoCodigo: {
    ...tipografia.textoSecundario,
    color: colores.textoSecundario,
  },

  badgeEstado: {
    paddingHorizontal: 10,
    paddingVertical: espaciados.xs,
    borderRadius: radios.pequeno,
    borderWidth: 1,
    marginLeft: espaciados.pequeno,
  },

  textoBadge: {
    ...tipografia.textoSecundario,
    fontWeight: pesosFuente.seminegrita,
  },
});
