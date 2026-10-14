import { BotonFiltros, CampoFiltro, ModalFiltros } from "@/components/utils/filtros";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { espaciados, estiloMapaOscuro, estilosComunes, obtenerColores, obtenerColoresEstado, pesosFuente, radios, tipografia } from "@/styles/theme";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from 'react-native-safe-area-context';
import { reportesService } from '../../src/servicios/reportes';
import { Coordenadas, EstadoReporte, Reporte, TipoDeReporte } from '../../src/tipos';
import { distanciaEnMetros } from '../../src/utilidades/geo';

const RADIO_CERCA_METROS = 50;

interface FiltrosMapa {
  tipoId: string | null;
  estado: EstadoReporte | null;
}

const FILTROS_POR_DEFECTO: FiltrosMapa = { tipoId: null, estado: null };

const ETIQUETA_ESTADO: Record<EstadoReporte, string> = {
  recibido: "Recibido",
  en_revision: "En revisión",
  asignado: "Asignado",
  resuelto: "Resuelto",
  rechazado: "Rechazado",
};

const obtenerInfoEstado = (estado: EstadoReporte, coloresEstado: ReturnType<typeof obtenerColoresEstado>) => {
  switch (estado) {
    case 'asignado':
      return { label: 'Asignado', color: coloresEstado.asignado.texto }; // Ámbar/Naranja
    case 'resuelto':
      return { label: 'Resuelto', color: coloresEstado.resuelto.texto }; // Verde
    case 'rechazado':
      return { label: 'Rechazado', color: coloresEstado.rechazado.texto }; // Rojo
    case 'en_revision':
      return { label: 'En revisión', color: coloresEstado.en_revision.texto }; // Azul
    case 'recibido':
      return { label: 'Recibido', color: coloresEstado.recibido.texto }; // Gris
  }
};

const obtenerIcono = (tipoId: string) => {
  switch (tipoId) {
    case 'tip-bache': return 'warning-outline';
    case 'tip-luz': return 'flash-off-outline';
    case 'tip-rama': return 'leaf-outline';
    case 'tip-basura': return 'trash-outline';
    case 'tip-agua': return 'water-outline';
    case 'tip-otro': return 'ellipsis-horizontal-outline';
  }
};

// Tocar un punto del mapa equivale a querer reportar ahí: pasa las coordenadas
// al formulario para que el reporte se cree en ese lugar.
const irANuevoReporte = (punto: Coordenadas) => {
  router.push({
    pathname: '/reclamos/nuevo-reporte',
    params: {
      lat: String(punto.latitud),
      lng: String(punto.longitud),
    },
  });
};

export default function MapaScreen() {
  const colorScheme = useColorScheme();
  //Creamos el estilo segun el color del modo del dispositivo 
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const coloresEstado = obtenerColoresEstado(tema);
  const styles = crearStyles(tema);

  //Reportes generados por los usuarios
  const [reportes, setReportes] = useState<Reporte[]>([]);

  //Tipos de reporte: bache, luminaria, basura, rama o árbol, agua o cloaca, semáforo, vereda, otro.
  const [tipos, setTipos] = useState<TipoDeReporte[]>([]);

  //Filtros aplicados al mapa
  const [filtros, setFiltros] = useState<FiltrosMapa>(FILTROS_POR_DEFECTO);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  //Estado si está cargando los datos del mapa o dio error
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intentos, setIntentos] = useState(0);

  //ubicacion del mapa por defecto Gualeguaychú
  //latitudeDelta y longitudeDelta indican cuánto territorio se muestra alrededor de la coordenada central del mapa.
  const [ubicacion, setUbicacion] = useState<Region>({
    latitude: -33.0069,
    longitude: -58.5142,
    latitudeDelta: 0.009,
    longitudeDelta: 0.00999,
  });

  //Permiso de ubicación: si se denegó y si el sistema todavía permite volver a preguntar
  const [permisoDenegado, setPermisoDenegado] = useState(false);
  const [puedePreguntar, setPuedePreguntar] = useState(true);

  //Referencia al mapa para moverlo cuando llega la posición del GPS
  const mapRef = useRef<MapView>(null);

  //Tarjeta contextual: un reporte tocado en el marcador, o un punto tocado con duplicados cerca
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [puntoTocado, setPuntoTocado] = useState<Coordenadas | null>(null);
  const [duplicadosCerca, setDuplicadosCerca] = useState<{ reporte: Reporte; distancia: number }[]>([]);
  const [sumando, setSumando] = useState(false);

  // ¿Está viendo algo distinto a la vista por defecto?
  const hayFiltrosActivos = filtros.tipoId !== null || filtros.estado !== null;

  // Grupos de filtros que muestra el modal
  const campos: CampoFiltro<FiltrosMapa>[] = [
    {
      clave: "tipoId",
      etiqueta: "Tipo",
      textoTodos: "Todos",
      opciones: tipos.map((t) => ({ valor: t.id, etiqueta: t.nombre })),
    },
    {
      clave: "estado",
      etiqueta: "Estado",
      textoTodos: "Todos",
      opciones: Object.entries(ETIQUETA_ESTADO).map(([valor, etiqueta]) => ({ valor, etiqueta })),
    },
  ];

  // Solo se dibujan en el mapa los reportes que cumplen los filtros
  // Más vecinos sumados = más arriba (mismo criterio que la bandeja del operador)
  const reportesVisibles = reportes
    .filter(
      (r) =>
        (filtros.tipoId === null || r.tipoId === filtros.tipoId) &&
        (filtros.estado === null || r.estado === filtros.estado),
    )
    .sort((a, b) => b.adhesiones - a.adhesiones || b.creadoEn.localeCompare(a.creadoEn));

  // Carga asíncrona desde la capa de servicios
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError(null);
      try {
        // El mapa de la ciudad muestra reportes públicos, no solo los propios
        const [respReportes, respTipos] = await Promise.all([
          reportesService.obtenerReportesPublicos(),
          reportesService.obtenerTipos(),
        ]);
        setReportes(respReportes.datos);
        setTipos(respTipos);
      } catch (e) {
        console.error('Error al cargar el mapa:', e);
        setError('No pudimos cargar el mapa. Revisá la conexión e intentá de nuevo.');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [intentos]);

  // Ubicación del usuario. `pedir` indica si se puede mostrar el diálogo de permiso.
  const obtenerUbicacion = async (pedir: boolean) => {
    try {
      // Solo consulta, no muestra el diálogo
      let permiso = await Location.getForegroundPermissionsAsync();

      if (!permiso.granted && permiso.canAskAgain && pedir) {
        permiso = await Location.requestForegroundPermissionsAsync();
      }

      if (!permiso.granted) {
        setPermisoDenegado(true);
        setPuedePreguntar(permiso.canAskAgain);
        return;
      }
      setPermisoDenegado(false);

      // Permiso otorgado, pero el GPS del teléfono puede estar apagado
      if (!(await Location.hasServicesEnabledAsync())) return;

      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const region: Region = {
        ...ubicacion,
        latitude: posicion.coords.latitude,
        longitude: posicion.coords.longitude,
      };
      setUbicacion(region);
      mapRef.current?.animateToRegion(region, 500);
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  };

  // Al abrir la pantalla: consulta y, si hace falta, pide el permiso
  useEffect(() => {
    obtenerUbicacion(true);
  }, []);

  // Al volver desde ajustes: solo re-chequea, sin volver a mostrar el diálogo
  useEffect(() => {
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active") obtenerUbicacion(false);
    });
    return () => sub.remove();
  }, []);

  const cerrarTarjetas = () => {
    setReporteSeleccionado(null);
    setPuntoTocado(null);
    setDuplicadosCerca([]);
  };

  // Tocar el mapa = quiero reportar en ese punto: primero chequear duplicados a menos de 50 m
  const alTocarMapa = (coordenada: { latitude: number; longitude: number }) => {
    setReporteSeleccionado(null);
    const punto: Coordenadas = {
      latitud: coordenada.latitude,
      longitud: coordenada.longitude,
    };

    const cerca = reportes
      .map((r) => ({
        reporte: r,
        distancia: distanciaEnMetros(punto, r.coordenadas),
      }))
      .filter((x) => x.distancia < RADIO_CERCA_METROS)
      .sort((a, b) => a.distancia - b.distancia);

    if (cerca.length === 0) {
      // No hay nada reportado ahí: ir directo al formulario en ese punto
      setPuntoTocado(null);
      setDuplicadosCerca([]);
      irANuevoReporte(punto);
      return;
    }

    // Vibración al detectar un reporte duplicado cerca (expo-haptics)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPuntoTocado(punto);
    setDuplicadosCerca(cerca);
  };

  // Tocar un marcador = ver ese reporte y poder sumarse
  const alTocarReporte = (reporte: Reporte) => {
    setPuntoTocado(null);
    setDuplicadosCerca([]);
    setReporteSeleccionado(reporte);
  };

  // El vecino se suma al reporte en vez de crear otro
  const alSumarse = async (reporteId: string) => {
    if (sumando) return;

    setSumando(true);
    try {
      const respuesta = await reportesService.sumarseAReporte(reporteId);
      setReportes((actuales) =>
        actuales.map((r) => (r.id === respuesta.datos.id ? respuesta.datos : r)),
      );
      setReporteSeleccionado((actual) =>
        actual?.id === respuesta.datos.id ? respuesta.datos : actual,
      );
      // Vibración al sumarse al reporte (expo-haptics)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cerrarTarjetas();
    } catch (e) {
      console.error('No pudimos sumarte al reporte:', e);
    } finally {
      setSumando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centro}>
        <Text style={styles.textoError}>{error}</Text>
        <Pressable style={styles.botonReintentar} onPress={() => setIntentos((i) => i + 1)}>
          <Text style={styles.textoBotonPrimario}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.mapa}
        ref={mapRef}
        initialRegion={ubicacion}
        showsUserLocation={!permisoDenegado}
        customMapStyle={colorScheme === "dark" ? estiloMapaOscuro : undefined}
        onPress={(e) => alTocarMapa(e.nativeEvent.coordinate)}
      >
        {reportesVisibles.map((r) => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.coordenadas.latitud, longitude: r.coordenadas.longitud }}
            onPress={(e) => {
              // El toque no debe burbujear al mapa (que crearía un reporte nuevo)
              e.stopPropagation();
              alTocarReporte(r);
            }}
          >
            <View style={[styles.pin, { backgroundColor: obtenerInfoEstado(r.estado, coloresEstado).color }]}  >
              <Ionicons
                name={(obtenerIcono(r.tipoId)) as any}
                size={16}
                color={colores.blanco}
              />
            </View>
          </Marker>
        ))}
        {/* Marcador temporal del punto tocado mientras se decide si es duplicado */}
        {puntoTocado && (
          <Marker
            coordinate={{ latitude: puntoTocado.latitud, longitude: puntoTocado.longitud }}
            anchor={{ x: 0.5, y: 1 }}
            pinColor={colores.primario}
          />
        )}
      </MapView>

      {/* Header flotante sobre el mapa */}
      <SafeAreaView style={styles.capaSuperior} pointerEvents="box-none">
        <View style={styles.header}>
          <Text style={styles.titulo}>Mapa de la ciudad</Text>
          <BotonFiltros
            onPress={() => setMostrarFiltros(true)}
            hayFiltrosActivos={hayFiltrosActivos}
          />
        </View>
        {permisoDenegado && (
          <View style={styles.avisoPermiso}>
            <Text style={styles.textoAvisoPermiso}>
              Sin permiso de ubicación. Te mostramos el centro de la ciudad.
            </Text>
            <Pressable
              onPress={() => (puedePreguntar ? obtenerUbicacion(true) : Linking.openSettings())}
            >
              <Text style={styles.linkAvisoPermiso}>
                {puedePreguntar ? "Permitir ubicación" : "Abrir ajustes"}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      {/* Tocaron un reporte existente: ver de qué se trata y sumarse */}
      {reporteSeleccionado && (
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>
            {reporteSeleccionado.descripcion === null
              ? "Sin descripción"
              : reporteSeleccionado.descripcion}
          </Text>
          <Text style={styles.tarjetaSubtitulo}>
            {obtenerInfoEstado(reporteSeleccionado.estado, coloresEstado).label} · {reporteSeleccionado.direccion}
          </Text>
          <Text style={styles.tarjetaSubtitulo}>
            {reporteSeleccionado.adhesiones === 1
              ? "1 vecino se sumó"
              : `${reporteSeleccionado.adhesiones} vecinos se sumaron`}
          </Text>
          <View style={styles.tarjetaBotones}>
            <Pressable
              style={styles.botonPrimario}
              onPress={() => alSumarse(reporteSeleccionado.id)}
              disabled={sumando}
            >
              <Text style={styles.textoBotonPrimario}>
                {sumando ? "Sumando..." : "Sumarse"}
              </Text>
            </Pressable>
            <Pressable style={styles.botonSecundario} onPress={cerrarTarjetas}>
              <Text style={styles.textoBotonSecundario}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Tocaron un punto sin reporte: existen duplicados cerca, ¿es el mismo problema? */}
      {puntoTocado && duplicadosCerca.length > 0 && (
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>
            Ya {duplicadosCerca.length === 1 ? "existe 1 reporte" : `existen ${duplicadosCerca.length} reportes`} a menos de {RADIO_CERCA_METROS} m de acá. ¿Es el mismo problema?
          </Text>
          <View style={styles.tarjetaBotones}>
            <Pressable
              style={styles.botonPrimario}
              onPress={() => alSumarse(duplicadosCerca[0].reporte.id)}
              disabled={sumando}
            >
              <Text style={styles.textoBotonPrimario}>
                {sumando ? "Sumando..." : "Sumarse"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.botonSecundario}
              onPress={() => {
                const punto = puntoTocado;
                cerrarTarjetas();
                irANuevoReporte(punto);
              }}
            >
              <Text style={styles.textoBotonSecundario}>Es otro problema</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ModalFiltros<FiltrosMapa>
        visible={mostrarFiltros}
        filtros={filtros}
        valoresPorDefecto={FILTROS_POR_DEFECTO}
        campos={campos}
        onAplicar={(nuevos) => {
          setFiltros(nuevos);
          setMostrarFiltros(false);
        }}
        onCerrar={() => setMostrarFiltros(false)}
      />
    </View>
  );
}

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: colores.fondo,
    },

    // El mapa ocupa toda la pantalla; el resto se superpone
    mapa: {
      ...StyleSheet.absoluteFillObject,
    },

    capaSuperior: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      margin: espaciados.medio,
      padding: espaciados.medio,
      borderRadius: radios.medio,
      backgroundColor: colores.superficie,
      elevation: 3,
    },

    titulo: {
      ...tipografia.tituloPantalla,
      color: colores.texto,
    },

    pin: {
      width: 30,
      height: 30,
      borderRadius: radios.grande,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colores.blanco,
    },

    centro: {
      ...estilosComunes.centro,
    },

    textoError: {
      ...tipografia.texto,
      color: colores.error,
      textAlign: "center",
      marginBottom: espaciados.medio,
    },

    botonReintentar: {
      padding: espaciados.pequeno,
      borderRadius: radios.pequeno,
      backgroundColor: colores.primario,
      alignItems: "center",
    },

    avisoPermiso: {
      marginHorizontal: espaciados.medio,
      backgroundColor: colores.fondoAdvertencia,
      borderRadius: radios.pequeno,
      padding: espaciados.pequeno,
    },

    textoAvisoPermiso: {
      ...tipografia.textoPequeno,
      color: colores.textoAdvertencia,
    },

    linkAvisoPermiso: {
      ...tipografia.textoPequeno,
      color: colores.enlace,
      marginTop: espaciados.xs,
    },

    tarjeta: {
      position: "absolute",
      bottom: espaciados.extraGrande,
      left: 14,
      right: 14,
      backgroundColor: colores.superficie,
      borderRadius: radios.medio,
      padding: espaciados.medio,
      elevation: 3,
    },

    tarjetaTitulo: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.texto,
    },

    tarjetaSubtitulo: {
      ...tipografia.textoPequeno,
      color: colores.textoSuave,
      marginBottom: espaciados.medio,
    },

    tarjetaBotones: {
      flexDirection: "row",
      gap: espaciados.pequeno,
    },

    botonSecundario: {
      flex: 1,
      padding: espaciados.pequeno,
      borderRadius: radios.pequeno,
      borderWidth: 0.5,
      borderColor: colores.borde,
      alignItems: "center",
    },

    botonPrimario: {
      flex: 1,
      padding: espaciados.pequeno,
      borderRadius: radios.pequeno,
      backgroundColor: colores.primario,
      alignItems: "center",
    },

    textoBotonPrimario: {
      ...tipografia.textoSecundario,
      fontWeight: pesosFuente.medio,
      color: colores.blanco,
    },

    textoBotonSecundario: {
      ...tipografia.textoSecundario,
      fontWeight: pesosFuente.medio,
      color: colores.texto,
    },

  });
};
