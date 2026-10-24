import { MarcadorReporte } from "@/components/MarcadorReporte";
import { BotonFiltros, CampoFiltro, ModalFiltros } from "@/components/utils/filtros";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { espaciados, estiloMapaOscuro, estilosComunes, obtenerColores, obtenerColoresEstado, pesosFuente, radios, tipografia } from "@/styles/theme";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from 'react-native-safe-area-context';
import { reportesService } from '../../src/servicios/reportes';
import { Coordenadas, EstadoReporte, Reporte, TipoDeReporte } from '../../src/tipos';
import { distanciaEnMetros } from '../../src/utilidades/geo';



export default function MapaScreen() {
  ///////////////////////////////////////////////
  // Constantes
  ///////////////////////////////////////////////
  const RADIO_CERCA_METROS = 50;
  const FILTROS_POR_DEFECTO: FiltrosMapa = { tipoId: null, estado: null };
  const ETIQUETA_ESTADO: Record<EstadoReporte, string> = {
    recibido: "Recibido",
    en_revision: "En revisión",
    asignado: "Asignado",
    resuelto: "Resuelto",
    rechazado: "Rechazado",
  };


  ///////////////////////////////////////////////
  // Declaraciones
  ///////////////////////////////////////////////
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";//Creamos el estilo segun el color del modo del dispositivo 
  const colores = obtenerColores(tema);
  const coloresEstado = obtenerColoresEstado(tema);
  const styles = crearStyles(tema);
  const [reportes, setReportes] = useState<Reporte[]>([]);   //Reportes generados por los usuarios
  const [tipos, setTipos] = useState<TipoDeReporte[]>([]);   //Tipos de reporte: bache, luminaria, basura, rama o árbol, agua o cloaca, semáforo, vereda, otro.

  const irANuevoReporte = (punto: Coordenadas) => {
    router.push({
      pathname: '/reclamos/nuevo-reporte',
      params: {
        lat: String(punto.latitud),
        lng: String(punto.longitud),
      },
    });
  };

  //Filtros aplicados al mapa
  interface FiltrosMapa {
    tipoId: string | null;
    estado: EstadoReporte | null;
    }
  const [filtros, setFiltros] = useState<FiltrosMapa>(FILTROS_POR_DEFECTO);
  const hayFiltrosActivos = filtros.tipoId !== null || filtros.estado !== null;
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  //Estado si está cargando los datos del mapa o dio error
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intentos, setIntentos] = useState(0);

  //MAPA
  const [ubicacion, setUbicacion] = useState<Region>({  //ubicacion del mapa por defecto Gualeguaychú
    latitude: -33.0069,
    longitude: -58.5142,
    latitudeDelta: 0.009,
    longitudeDelta: 0.00999,
  });
  const mapRef = useRef<MapView>(null);   //Referencia al mapa para moverlo cuando llega la posición del GPS
  
  const ocultarPOI = [//Para ocultar los puntos de interes de google 
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
  ];
  const reportesVisibles = reportes.filter((r) => // Solo se dibujan en el mapa los reportes que cumplen los filtros
    (filtros.tipoId === null || r.tipoId === filtros.tipoId) &&
    (filtros.estado === null || r.estado === filtros.estado),);

  //ACCIONES
  const [permisoDenegado, setPermisoDenegado] = useState(false);//Permiso de ubicación: si se denegó y si el sistema todavía permite volver a preguntar
  const [puedePreguntar, setPuedePreguntar] = useState(true);
  const [puntoTocado, setPuntoTocado] = useState<Coordenadas | null>(null);
  const [puntoTocadoConfirmar, setPuntoTocadoConfirmar] = useState<Coordenadas | null>(null);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [duplicadosCerca, setDuplicadosCerca] = useState<{ reporte: Reporte; distancia: number }[]>([]);
  const [sumando, setSumando] = useState(false);


  //MODAL
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

  ///////////////////////////////////////////////
  // Acciones
  ///////////////////////////////////////////////

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
  // Ubicación del usuario. 
  const obtenerUbicacion = async (pedir: boolean) => { // Variable: pedir. Indica si se puede mostrar el diálogo de permiso.
    try {
      let permiso = await Location.getForegroundPermissionsAsync(); // Solo consultamos si hay permiso, no mostramos alert

      if (!permiso.granted && permiso.canAskAgain && pedir) {
        permiso = await Location.requestForegroundPermissionsAsync();
      }

      if (!permiso.granted) {
        setPermisoDenegado(true);
        setPuedePreguntar(permiso.canAskAgain);
        return;
      }
      setPermisoDenegado(false);

      if (!(await Location.hasServicesEnabledAsync())) return; // Permiso otorgado, verificamos si el GPS puede estar apagado

      const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const region: Region = { ...ubicacion, latitude: posicion.coords.latitude, longitude: posicion.coords.longitude };
      setUbicacion(region); //Guardamos la ubicacion real del usuario
      mapRef.current?.animateToRegion(region, 500);
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  };

  const cerrarTarjetas = () => {
    setReporteSeleccionado(null);
    setPuntoTocado(null);
    setDuplicadosCerca([]);
    setPuntoTocadoConfirmar(null);
  };

  const confirmarNuevoReporte = () => {
    if (!puntoTocadoConfirmar) return;
    const punto = puntoTocadoConfirmar;
    setPuntoTocadoConfirmar(null);
    irANuevoReporte(punto);
  };

  const cancelarNuevoReporte = () => setPuntoTocadoConfirmar(null);

  //Acciones sobre el mapa
  //Al tocar el marcador de un reporte creado
  const alTocarReporte = (reporte: Reporte) => { 
    setPuntoTocado(null);
    setPuntoTocadoConfirmar(null);
    setDuplicadosCerca([]);
    setReporteSeleccionado(reporte);
  };

  //Acciones sobre el mapa
  //Al tocar un lugar libre
  const alTocarMapa = (coordenada: { latitude: number; longitude: number }) => {
      setReporteSeleccionado(null);
      const punto: Coordenadas = { latitud: coordenada.latitude, longitud: coordenada.longitude };

      const cerca = reportes.map((r) => ({ reporte: r, distancia: distanciaEnMetros(punto, r.coordenadas) }))
        .filter((x) => x.distancia < RADIO_CERCA_METROS)
        .sort((a, b) => a.distancia - b.distancia);

      if (cerca.length === 0) { // No hay nada reportado ahí: preguntar  antes de ir al formulario 
        setPuntoTocado(null);
        setDuplicadosCerca([]);
        //irANuevoReporte(punto);
        setPuntoTocadoConfirmar(punto);
        return;
      }

      // Agregamos vibracian al detectar un reporte duplicado cerca 
      setPuntoTocadoConfirmar(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPuntoTocado(punto);
      setDuplicadosCerca(cerca);
    };

    ///Acciones sobre el mapa
    //Al tocar un lugar cerca de un reporte creado
  const alSumarse = async (reporteId: string) => { // El vecino se suma al reporte en vez de crear otro
    if (sumando) return;
    setSumando(true);
    try {
      const respuesta = await reportesService.sumarseAReporte(reporteId);
      setReportes((actuales) => actuales.map((r) => (r.id === respuesta.datos.id ? respuesta.datos : r)));
      setReporteSeleccionado((actual) => actual?.id === respuesta.datos.id ? respuesta.datos : actual);
      // Vibración al sumarse al reporte 
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cerrarTarjetas();
    } catch (e) {
      console.error('No pudimos sumarte al reporte:', e);
    } finally {
      setSumando(false);
    }
  };

  
  ///////////////////////////////////////////////
  // HOOKS
  ///////////////////////////////////////////////

  //Hook para obtener la ubicacion del mapa, se ejecuta una sola vez
  useEffect(() => {
    obtenerUbicacion(true);
  }, []);

  //Hook que se recarga siempre para tener los datos actualizados del mapa
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      const cargarDatos = async () => {
        console.log("ingreso al primer hook");
        setCargando(true);
        setError(null);
        try {
          // El mapa de la ciudad muestra TODOS los reportes 
          const [respReportes, respTipos] = await Promise.all([reportesService.obtenerReportesPublicos(), reportesService.obtenerTipos(),]);

          if (activo) {
            setReportes(respReportes.datos);
            setTipos(respTipos);
          }

        } catch (e) {
          if (activo)
            setError('No pudimos cargar el mapa. Revisá la conexión e intentá de nuevo.');
        } finally {
          if (activo)
            setCargando(false);
        }

      };
      cargarDatos();
      return () => { activo = false; };
    }, [intentos])//Al incrementar intentos se vuelva a ejecutar este useEffect
  );

  //Hook para cuando se cambia de aplicaciones del celu
  useEffect(() => {
    const sub = AppState.addEventListener("change", (estado) => {
      if (estado === "active")
        obtenerUbicacion(false);
    });
    return () => sub.remove();
  }, []);


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
        googleRenderer="LEGACY"
        showsUserLocation={!permisoDenegado}
        customMapStyle={colorScheme === "dark" ? [...estiloMapaOscuro, ...ocultarPOI] : ocultarPOI}
        onPress={(e) => alTocarMapa(e.nativeEvent.coordinate)} >
        
        {/* Los marcadores customizados de todos los reportes informados */}
        {reportesVisibles.map((r) => (
          <MarcadorReporte
            key={r.id}
            reporte={r}
            color={obtenerInfoEstado(r.estado, coloresEstado).color}
            onPress={alTocarReporte}
          /> 
        ))}

        {/* Nuevo Marcador: punto tocado */}
        {(puntoTocado || puntoTocadoConfirmar) && (
          <Marker
            coordinate={{
              latitude: (puntoTocado ?? puntoTocadoConfirmar)!.latitud,
              longitude: (puntoTocado ?? puntoTocadoConfirmar)!.longitud,
            }}
            anchor={{ x: 0.5, y: 1 }}
            pinColor={colores.primario}
          />
        )}
      </MapView>

      {/* Cartel para nuevo punto si quiere cargar ahi nuevo reporte */}
      {puntoTocadoConfirmar && (
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>¿Generar un nuevo reporte aquí?</Text>
          <View style={styles.tarjetaBotones}>
            <Pressable style={[styles.botonSecundario]} onPress={cancelarNuevoReporte} >
              <Text style={styles.textoBotonSecundario}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.botonPrimario]} onPress={confirmarNuevoReporte}  >
              <Text style={styles.textoBotonPrimario}>Sí, reportar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Header flotante sobre el mapa, con titulo y filtros */}
      <SafeAreaView style={styles.capaSuperior} pointerEvents="box-none">
        <View style={styles.header}>
          <Text style={styles.titulo}>Mapa de la ciudad</Text>
          <BotonFiltros
            onPress={() => setMostrarFiltros(true)}
            hayFiltrosActivos={hayFiltrosActivos}
          />
        </View>

        {/* Cartel si no tiene permiso de GPS muestra mensaje */}
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

      {/* Cartel: Reporte existente. Mostramos informacion y boton para sumarse (sumarse si no fue resuelto o rechazado) */}
      {reporteSeleccionado && (() => {
        const estado = reporteSeleccionado.estado?.toLowerCase();
        const puedeSumarse = estado !== "rechazado" && estado !== "resuelto";

        return (
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
              {puedeSumarse && (
                <Pressable
                  style={styles.botonPrimario}
                  onPress={() => alSumarse(reporteSeleccionado.id)}
                  disabled={sumando}
                >
                  <Text style={styles.textoBotonPrimario}>
                    {sumando ? "Sumando..." : "Sumarse"}
                  </Text>
                </Pressable>
              )}
              <Pressable style={styles.botonSecundario} onPress={cerrarTarjetas}>
                <Text style={styles.textoBotonSecundario}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        );
      })()}

      {/* Cartel: Tocaron un punto sin reporte. Verificamos si existen duplicados cerca */}
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

      {/* Modal: Para los filtros */}
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

    // El mapa ocupa toda la pantalla 
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
