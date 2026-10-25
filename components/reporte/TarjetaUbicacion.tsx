import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import MapView, {
  MapPressEvent,
  Marker,
  MarkerDragStartEndEvent,
} from "react-native-maps";
import { Coordenadas } from "../../src/tipos";
import {
  distanciaEnMetros,
  formatearDistancia,
} from "../../src/utilidades/geo";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tipografia,
} from "../../styles/theme";

// Centro de Gualeguaychú: se muestra si no hay GPS (mismo punto que la pantalla del mapa).
const CENTRO_POR_DEFECTO: Coordenadas = {
  latitud: -33.0069,
  longitud: -58.5142,
};
const TIEMPO_LIMITE_GPS_MS = 15000;

// Si el GPS no responde a tiempo, cortamos la espera para no dejar la pantalla cargando.
function conTiempoLimite<T>(promesa: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolver, rechazar) => {
    const temporizador = setTimeout(
      () => rechazar(new Error("tiempo agotado")),
      ms,
    );
    promesa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolver(valor);
      },
      (error) => {
        clearTimeout(temporizador);
        rechazar(error);
      },
    );
  });
}

type Props = {
  ubicacion: Coordenadas | null;
  // Si viene del mapa (punto tocado), se usa en vez del GPS
  ubicacionInicial?: Coordenadas | null;
  onUbicacionChange: (coordenada: Coordenadas | null) => void;
  onDireccionChange: (direccion: string | null) => void;
};

export function TarjetaUbicacion({
  ubicacion,
  ubicacionInicial,
  onUbicacionChange,
  onDireccionChange,
}: Props) {
  const [ubicacionOriginal, setUbicacionOriginal] =
    useState<Coordenadas | null>(null);
  const [precisionGps, setPrecisionGps] = useState<number | null>(null);
  const [pinFueMovido, setPinFueMovido] = useState(false);
  const [direccion, setDireccion] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  // null = el GPS anda. "permiso" = lo negaron. "gps" = permiso ok pero no se pudo leer.
  const [sinGps, setSinGps] = useState<"permiso" | "gps" | null>(null);
  const [puedePreguntar, setPuedePreguntar] = useState(true);

  const colorScheme = useColorScheme();
  const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  const obtenerGps = useCallback(
    async (pedirPermiso: boolean) => {
      setCargando(true);
      try {
        let permiso = await Location.getForegroundPermissionsAsync();
        if (!permiso.granted && permiso.canAskAgain && pedirPermiso) {
          permiso = await Location.requestForegroundPermissionsAsync();
        }

        if (!permiso.granted) {
          setSinGps("permiso");
          setPuedePreguntar(permiso.canAskAgain);
          return;
        }

        if (!(await Location.hasServicesEnabledAsync())) {
          setSinGps("gps");
          return;
        }

        const posicion = await conTiempoLimite(
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          TIEMPO_LIMITE_GPS_MS,
        );
        const coordenada = {
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
        };
        setUbicacionOriginal(coordenada);
        onUbicacionChange(coordenada);
        setPrecisionGps(posicion.coords.accuracy ?? null);
        setPinFueMovido(false);
        setSinGps(null);
      } catch {
        setSinGps("gps");
      } finally {
        setCargando(false);
      }
    },
    [onUbicacionChange],
  );

  // Usamos números sueltos (no el objeto) para que el efecto no se repita en cada render.
  const latInicial = ubicacionInicial?.latitud;
  const lngInicial = ubicacionInicial?.longitud;

  useEffect(() => {
    // Si el punto viene del mapa, no pedimos el GPS: usamos ese punto tal cual.
    if (latInicial !== undefined && lngInicial !== undefined) {
      const punto = { latitud: latInicial, longitud: lngInicial };
      setUbicacionOriginal(punto);
      onUbicacionChange(punto);
      setPrecisionGps(null);
      setCargando(false);
      return;
    }

    obtenerGps(true);
  }, [latInicial, lngInicial, onUbicacionChange, obtenerGps]);

  // Cada vez que cambia el punto (GPS, mapa o pin arrastrado), buscamos la dirección.
  useEffect(() => {
    if (!ubicacion) return;
    let cancelado = false;

    const resolverDireccion = async () => {
      let texto: string | null = null;
      try {
        const resultados = await Location.reverseGeocodeAsync({
          latitude: ubicacion.latitud,
          longitude: ubicacion.longitud,
        });
        const lugar = resultados[0];
        const calle = [lugar?.street, lugar?.streetNumber]
          .filter(Boolean)
          .join(" ");
        texto = calle || lugar?.name || null;
      } catch {
        // Sin conexión o sin servicio: queda en null y el reporte usa las coordenadas.
      }
      if (!cancelado) {
        setDireccion(texto);
        onDireccionChange(texto);
      }
    };

    resolverDireccion();
    return () => {
      cancelado = true;
    };
  }, [ubicacion?.latitud, ubicacion?.longitud, onDireccionChange, ubicacion]);

  const alSoltarElPin = (evento: MarkerDragStartEndEvent) => {
    onUbicacionChange({
      latitud: evento.nativeEvent.coordinate.latitude,
      longitud: evento.nativeEvent.coordinate.longitude,
    });
    setPinFueMovido(true);
  };

  // Sin GPS el vecino marca el punto tocando el mapa. Si ya hay punto, se mueve arrastrando.
  const alTocarMapa = (evento: MapPressEvent) => {
    if (ubicacion) return;
    const { latitude, longitude } = evento.nativeEvent.coordinate;
    onUbicacionChange({ latitud: latitude, longitud: longitude });
  };

  const alTocarEnlace = () => {
    if (sinGps === "permiso" && !puedePreguntar) {
      Linking.openSettings();
    } else {
      obtenerGps(true);
    }
  };

  const textoEnlace =
    sinGps === "permiso"
      ? puedePreguntar
        ? "Permitir ubicación"
        : "Abrir ajustes"
      : "Reintentar GPS";

  const distanciaCorregida =
    ubicacionOriginal && ubicacion
      ? distanciaEnMetros(ubicacionOriginal, ubicacion)
      : 0;

  const textoDistancia = sinGps
    ? "Marcaste este punto en el mapa"
    : pinFueMovido
      ? `Corregiste el punto ${formatearDistancia(distanciaCorregida)}`
      : ubicacionInicial
        ? "Elegiste este punto en el mapa"
        : precisionGps
          ? `A ${formatearDistancia(precisionGps)} de tu ubicación`
          : "Ubicación desde el GPS";

  const textoAviso =
    sinGps === "permiso"
      ? "Sin permiso de ubicación. Te mostramos Gualeguaychú: tocá el mapa para marcar dónde está el problema."
      : "No pudimos leer el GPS. Te mostramos Gualeguaychú: tocá el mapa para marcar dónde está el problema.";

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>¿Dónde?</Text>
      <View style={styles.tarjetaUbicacion}>
        {cargando ? (
          <View style={styles.centro}>
            <ActivityIndicator color={colores.texto} />
          </View>
        ) : (
          <>
            {sinGps && !ubicacion ? (
              <Text style={styles.textoAviso}>{textoAviso}</Text>
            ) : (
              <>
                {direccion && (
                  <Text style={styles.direccionTexto}>{direccion}</Text>
                )}
                <Text style={styles.distanciaTexto}>{textoDistancia}</Text>
              </>
            )}

            <MapView
              style={styles.mapa}
              initialRegion={{
                latitude: (ubicacion ?? CENTRO_POR_DEFECTO).latitud,
                longitude: (ubicacion ?? CENTRO_POR_DEFECTO).longitud,
                latitudeDelta: ubicacion ? 0.005 : 0.02,
                longitudeDelta: ubicacion ? 0.005 : 0.02,
              }}
              onPress={alTocarMapa}
            >
              {ubicacion && (
                <Marker
                  coordinate={{
                    latitude: ubicacion.latitud,
                    longitude: ubicacion.longitud,
                  }}
                  draggable
                  onDragEnd={alSoltarElPin}
                />
              )}
            </MapView>

            {sinGps && (
              <Pressable onPress={alTocarEnlace}>
                <Text style={styles.linkAviso}>{textoEnlace}</Text>
              </Pressable>
            )}
          </>
        )}
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
    centro: {
      height: 180,
      alignItems: "center",
      justifyContent: "center",
    },
    textoAviso: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
      marginBottom: espaciados.pequeno,
    },
    direccionTexto: {
      ...tipografia.texto,
      fontWeight: pesosFuente.negrita,
      color: colores.texto,
    },
    distanciaTexto: {
      ...tipografia.textoSecundario,
      color: colores.textoSecundario,
      marginBottom: espaciados.pequeno,
    },
    mapa: {
      width: "100%",
      height: 180,
      borderRadius: radios.pequeno,
    },
    linkAviso: {
      ...tipografia.textoSecundario,
      color: colores.texto,
      textDecorationLine: "underline",
      marginTop: espaciados.pequeno,
    },
  });
};
