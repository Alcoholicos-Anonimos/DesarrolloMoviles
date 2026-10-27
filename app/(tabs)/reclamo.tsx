import { pedirPermiso } from "@/src/servicios/avisos";
import { avisosActivosDe } from "@/src/servicios/preferenciasAvisos";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Link, router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { reportesService } from "../../src/servicios/reportes";
import { EstadoReporte, Reporte, TipoDeReporte } from "../../src/tipos";
import {
  espaciados,
  obtenerColores,
  obtenerColoresEstado,
  pesosFuente,
  radios,
  tamaniosIconos,
  tipografia,
} from "../../styles/theme";

import { useAuth } from "@/src/contexto/AuthContext";
// Función auxiliar para mapear el color y texto según el estado
const obtenerInfoEstado = (
  estado: EstadoReporte,
  coloresEstado: ReturnType<typeof obtenerColoresEstado>,
) => {
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
  const { cerrarSesion, usuario } = useAuth();

  useEffect(() => {
    if (!usuario) return;
    (async () => {
      if (await avisosActivosDe(usuario.id)) await pedirPermiso();
    })();
  }, [usuario]);

  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const coloresEstado = obtenerColoresEstado(tema);
  const styles = crearStyles(tema);

  const confirmarCerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Querés salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: cerrarSesion },
    ]);
  };

  // Carga asíncrona desde la capa de servicios
  useFocusEffect(() => {
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
  });

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
          <Link href="/avisos" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.botonAgregar,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityLabel="Avisos"
            >
              <Ionicons
                name="notifications-outline"
                size={tamaniosIconos.grande}
                color={colores.texto}
              />
            </Pressable>
          </Link>

          <Pressable
            onPress={confirmarCerrarSesion}
            style={({ pressed }) => [
              styles.botonAgregar,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons
              name="log-out-outline"
              size={tamaniosIconos.grande}
              color={colores.texto}
            />
          </Pressable>

          <Link href="/reclamos/nuevo-reporte" asChild>
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
            const estadoInfo = obtenerInfoEstado(item.estado, coloresEstado);

            return (
              <Pressable
                style={({ pressed }) => [
                  styles.itemRow,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/reclamos/[id]",
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

const crearStyles = (tema: "light" | "dark") => {
  const colores = obtenerColores(tema);

  return StyleSheet.create({
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
};
