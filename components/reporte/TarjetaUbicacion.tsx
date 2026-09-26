import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import MapView, { Marker, MarkerDragStartEndEvent } from "react-native-maps";
import {
    espaciados,
    obtenerColores,
    radios,
    tipografia,
} from "../../styles/theme";

type Coordenada = { latitud: number; longitud: number };

// Fórmula de Haversine: calcula la distancia en metros entre dos puntos GPS.
function calcularDistanciaEnMetros(a: Coordenada, b: Coordenada) {
  const radioTierra = 6371000; // metros
  const rad = (grados: number) => (grados * Math.PI) / 180;

  const dLat = rad(b.latitud - a.latitud);
  const dLon = rad(b.longitud - a.longitud);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const valor =
    sinLat * sinLat +
    Math.cos(rad(a.latitud)) * Math.cos(rad(b.latitud)) * sinLon * sinLon;

  const distancia = 2 * radioTierra * Math.asin(Math.sqrt(valor));
  return Math.round(distancia);
}

export function TarjetaUbicacion() {
  const [ubicacionOriginal, setUbicacionOriginal] = useState<Coordenada | null>(
    null,
  );
  const [ubicacionPin, setUbicacionPin] = useState<Coordenada | null>(null);
  const [cargando, setCargando] = useState(true);
  const [permisoDenegado, setPermisoDenegado] = useState(false);

  const colorScheme = useColorScheme();
  const colores = obtenerColores(colorScheme === "dark" ? "dark" : "light");
  const styles = crearStyles(colorScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    const obtenerUbicacion = async () => {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) {
        setPermisoDenegado(true);
        setCargando(false);
        return;
      }

      const posicion = await Location.getCurrentPositionAsync({});
      const coordenada = {
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
      };
      setUbicacionOriginal(coordenada);
      setUbicacionPin(coordenada);
      setCargando(false);
    };

    obtenerUbicacion();
  }, []);

  const alSoltarElPin = (evento: MarkerDragStartEndEvent) => {
    setUbicacionPin({
      latitud: evento.nativeEvent.coordinate.latitude,
      longitud: evento.nativeEvent.coordinate.longitude,
    });
  };

  const distancia =
    ubicacionOriginal && ubicacionPin
      ? calcularDistanciaEnMetros(ubicacionOriginal, ubicacionPin)
      : 0;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>¿Dónde?</Text>
      <View style={styles.tarjetaUbicacion}>
        {cargando ? (
          <View style={styles.centro}>
            <ActivityIndicator color={colores.texto} />
          </View>
        ) : permisoDenegado ? (
          <Text style={styles.textoAviso}>
            No pudimos acceder a tu ubicación. Activá el permiso para marcar el
            lugar del problema.
          </Text>
        ) : (
          <>
            <Text style={styles.distanciaTexto}>
              {distancia === 0
                ? "Ubicación desde el GPS"
                : `Corregiste el punto ${distancia} m`}
            </Text>
            <MapView
              style={styles.mapa}
              initialRegion={{
                latitude: ubicacionPin!.latitud,
                longitude: ubicacionPin!.longitud,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: ubicacionPin!.latitud,
                  longitude: ubicacionPin!.longitud,
                }}
                draggable
                onDragEnd={alSoltarElPin}
              />
            </MapView>
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
  });
};
