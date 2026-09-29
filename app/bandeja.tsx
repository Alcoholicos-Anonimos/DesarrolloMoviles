import Ionicons from "@react-native-vector-icons/ionicons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/contexto/AuthContext";
import { bandejaService } from "@/src/servicios/bandeja";
import { reportesService } from "@/src/servicios/reportes";
import { FiltrosBandeja } from "@/src/servicios/bandeja";
import { ModalFiltros } from "@/components/bandeja/ModalFiltros";
import { ModalAsignarCuadrilla } from "@/components/bandeja/ModalAsignarCuadrilla";
import { ModalCambiarEstado } from "@/components/bandeja/ModalCambiarEstado";
import { ModalDuplicado } from "@/components/bandeja/ModalDuplicado";
import {
  Cuadrilla,
  EstadoReporte,
  Reporte,
  TipoDeReporte,
  Zona,
} from "@/src/tipos";
import {
  espaciados,
  obtenerColores,
  obtenerColoresEstado,
  pesosFuente,
  radios,
  tipografia,
} from "@/styles/theme";

const ETIQUETA_ESTADO: Record<EstadoReporte, string> = {
  recibido: "Recibido",
  en_revision: "En revisión",
  asignado: "Asignado",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
};

export default function BandejaScreen() {
  const { usuario, cerrarSesion } = useAuth();

  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const coloresEstado = obtenerColoresEstado(tema);
  const styles = crearStyles(tema);

  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [tipos, setTipos] = useState<TipoDeReporte[]>([]);
  const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zonaPorDefecto = usuario?.zonaId ?? null;
  const [filtros, setFiltros] = useState<FiltrosBandeja>({
    zonaId: zonaPorDefecto,
    estado: null,
    tipoId: null,
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [reporteAsignar, setReporteAsignar] = useState<Reporte | null>(null);
  const [reporteEstado, setReporteEstado] = useState<Reporte | null>(null);
  const [reporteDuplicado, setReporteDuplicado] = useState<Reporte | null>(null);

  // ¿Está viendo algo distinto a la vista por defecto?
  const hayFiltrosActivos =
    filtros.estado !== null ||
    filtros.tipoId !== null ||
    filtros.zonaId !== zonaPorDefecto;

  // Trae todo lo que necesita la pantalla, siempre por servicios
  const cargar = useCallback(async () => {
    setError(null);
    try {
      const [respReportes, respTipos, respCuadrillas, respZonas] =
        await Promise.all([
          bandejaService.listar(filtros),
          reportesService.obtenerTipos(),
          bandejaService.obtenerCuadrillas(null),
          bandejaService.obtenerZonas(),
        ]);
      setReportes(respReportes.datos);
      setTipos(respTipos);
      setCuadrillas(respCuadrillas);
      setZonas(respZonas);
    } catch {
      setError("No pudimos cargar la bandeja. Probá de nuevo.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const refrescar = () => {
    setRefrescando(true);
    cargar();
  };

  const nombreZona =
    zonas.find((z) => z.id === filtros.zonaId)?.nombre ?? "Todas las zonas";

  const aplicarFiltros = (nuevos: FiltrosBandeja) => {
    setMostrarFiltros(false);
    setCargando(true);
    setFiltros(nuevos);
  };

  const confirmarCerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Querés salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: cerrarSesion },
    ]);
  };


  const renderTarjeta = ({ item }: { item: Reporte }) => {
    const tipo = tipos.find((t) => t.id === item.tipoId);
    const cuadrilla = cuadrillas.find((c) => c.id === item.cuadrillaId);
    const colorEstado = coloresEstado[item.estado];
    const original = item.duplicadoDe
      ? reportes.find((r) => r.id === item.duplicadoDe)
      : null;
    const accionPrincipal = item.cuadrillaId
      ? "Cambiar estado"
      : "Asignar cuadrilla";

    return (
      <View style={styles.tarjeta}>
        <View style={styles.filaTitulo}>
          <Text style={styles.tituloTarjeta} numberOfLines={1}>
            {tipo?.nombre ?? "Reporte"} - {item.direccion}
          </Text>
          {/* Tocar el estado también permite cambiarlo (sirve aunque no tenga cuadrilla) */}
          <Pressable
            onPress={() => setReporteEstado(item)}
            hitSlop={8}
            accessibilityLabel={`Estado: ${ETIQUETA_ESTADO[item.estado]}. Tocá para cambiarlo`}
            style={[styles.badge, { backgroundColor: colorEstado.fondo }]}
          >
            <Text style={[styles.textoBadge, { color: colorEstado.texto }]}>
              {ETIQUETA_ESTADO[item.estado]}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colorEstado.texto} />
          </Pressable>
        </View>

        <Text style={styles.subtitulo}>
          {item.codigo} - {cuadrilla ? cuadrilla.nombre : "Sin asignar"}
        </Text>

        {item.adhesiones > 0 && (
          <Text style={styles.detalle}>
            {item.adhesiones} vecino{item.adhesiones === 1 ? "" : "s"} se
            sumaron
          </Text>
        )}

        {item.duplicadoDe && (
          <Text style={styles.detalle}>
            Duplicado de {original?.codigo ?? item.duplicadoDe}
          </Text>
        )}

        <View style={styles.filaBotones}>
          <Pressable
            style={({ pressed }) => [
              styles.botonTarjeta,
              pressed && styles.presionado,
            ]}
            onPress={() =>
              item.cuadrillaId
                ? setReporteEstado(item)
                : setReporteAsignar(item)
            }
          >
            <Text style={styles.textoBotonTarjeta}>{accionPrincipal}</Text>
          </Pressable>
          {/* Si ya es duplicado de otro, no tiene sentido volver a marcarlo */}
          {!item.duplicadoDe && (
            <Pressable
              style={({ pressed }) => [
                styles.botonTarjeta,
                pressed && styles.presionado,
              ]}
              onPress={() => setReporteDuplicado(item)}
            >
              <Text style={styles.textoBotonTarjeta}>Duplicado</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <Text style={styles.titulo} numberOfLines={1}>
          Bandeja - {nombreZona}
        </Text>
        <View style={styles.filaIconos}>
          <Pressable
            onPress={() => setMostrarFiltros(true)}
            hitSlop={8}
            accessibilityLabel={
              hayFiltrosActivos ? "Filtros (hay filtros activos)" : "Filtros"
            }
          >
            <Ionicons
              name={hayFiltrosActivos ? "options" : "options-outline"}
              size={26}
              color={colores.texto}
            />
          </Pressable>
          <Pressable
            onPress={confirmarCerrarSesion}
            hitSlop={8}
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={26} color={colores.texto} />
          </Pressable>
        </View>
      </View>

      {/* CONTENIDO */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centro}>
          <Text style={styles.textoError}>{error}</Text>
          <Pressable style={styles.botonReintentar} onPress={refrescar}>
            <Text style={styles.textoBotonReintentar}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          renderItem={renderTarjeta}
          contentContainerStyle={styles.lista}
          refreshing={refrescando}
          onRefresh={refrescar}
          ListEmptyComponent={
            <Text style={styles.textoVacio}>
              {hayFiltrosActivos
                ? "No hay reportes con esos filtros."
                : "No hay reportes en tu zona."}
            </Text>
          }
        />
      )}
      <ModalFiltros
        visible={mostrarFiltros}
        filtros={filtros}
        zonaPorDefecto={zonaPorDefecto}
        tipos={tipos}
        zonas={zonas}
        onAplicar={aplicarFiltros}
        onCerrar={() => setMostrarFiltros(false)}
      />
      <ModalAsignarCuadrilla
        reporte={reporteAsignar}
        operadorId={usuario?.id ?? ""}
        onCerrar={() => setReporteAsignar(null)}
        onListo={() => {
          setReporteAsignar(null);
          cargar();
        }}
      />
      <ModalCambiarEstado
        reporte={reporteEstado}
        operadorId={usuario?.id ?? ""}
        onCerrar={() => setReporteEstado(null)}
        onListo={() => {
          setReporteEstado(null);
          cargar();
        }}
      />

      <ModalDuplicado
        reporte={reporteDuplicado}
        tipos={tipos}
        operadorId={usuario?.id ?? ""}
        onCerrar={() => setReporteDuplicado(null)}
        onListo={() => {
          setReporteDuplicado(null);
          cargar();
        }}
      />
    </SafeAreaView>
  );
}

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colores.fondo,
      paddingHorizontal: espaciados.extraGrande,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: espaciados.grande,
      gap: espaciados.medio,
    },
    titulo: {
      ...tipografia.titulo,
      color: colores.texto,
      flex: 1,
    },
    filaIconos: {
      flexDirection: "row",
      gap: espaciados.grande,
    },
    centro: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: espaciados.grande,
    },
    lista: {
      gap: espaciados.medio,
      paddingBottom: espaciados.enorme,
    },

    // Tarjeta
    tarjeta: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.bordeSuave,
      borderRadius: radios.medio,
      padding: espaciados.medio,
      gap: espaciados.pequeno,
    },
    filaTitulo: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: espaciados.pequeno,
    },
    tituloTarjeta: {
      ...tipografia.tituloSeccion,
      color: colores.texto,
      flex: 1,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingHorizontal: 10,
      paddingVertical: espaciados.xs,
      borderRadius: radios.pequeno,
    },
    textoBadge: {
      ...tipografia.textoSecundario,
      fontWeight: pesosFuente.seminegrita,
    },
    subtitulo: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
    },
    detalle: {
      ...tipografia.textoPequeno,
      color: colores.textoSuave,
    },
    filaBotones: {
      flexDirection: "row",
      gap: espaciados.pequeno,
      marginTop: espaciados.xs,
    },
    botonTarjeta: {
      flex: 1,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.pequeno,
    },
    textoBotonTarjeta: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.texto,
    },
    presionado: { opacity: 0.6 },

    // Estados especiales
    textoVacio: {
      ...tipografia.texto,
      color: colores.textoSecundario,
      textAlign: "center",
      marginTop: espaciados.enorme,
    },
    textoError: {
      ...tipografia.texto,
      color: colores.textoPeligro,
      textAlign: "center",
    },
    botonReintentar: {
      backgroundColor: colores.primario,
      borderRadius: radios.redondo,
      paddingVertical: espaciados.medio,
      paddingHorizontal: espaciados.muyGrande,
    },
    textoBotonReintentar: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.blanco,
    },
  });
};
