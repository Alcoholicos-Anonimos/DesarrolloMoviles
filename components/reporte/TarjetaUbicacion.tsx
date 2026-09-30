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
import { Coordenadas } from "../../src/tipos";
import {
  distanciaEnMetros,
  formatearDistancia,
} from "../../src/utilidades/geo";
import {
  espaciados,
  obtenerColores,
  radios,
  tipografia,
} from "../../styles/theme";

type Props = {
  ubicacion: Coordenadas | null;
  onUbicacionChange: (coordenada: Coordenadas | null) => void;
};

export function TarjetaUbicacion({ ubicacion, onUbicacionChange }: Props) {
  const [ubicacionOriginal, setUbicacionOriginal] =
    useState<Coordenadas | null>(null);
  const [precisionGps, setPrecisionGps] = useState<number | null>(null);
  const [pinFueMovido, setPinFueMovido] = useState(false);
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
      onUbicacionChange(coordenada);
      setPrecisionGps(posicion.coords.accuracy ?? null);
      setCargando(false);
    };

    obtenerUbicacion();
  }, []);

  const alSoltarElPin = (evento: MarkerDragStartEndEvent) => {
    onUbicacionChange({
      latitud: evento.nativeEvent.coordinate.latitude,
      longitud: evento.nativeEvent.coordinate.longitude,
    });
    setPinFueMovido(true);
  };

  const distanciaCorregida =
    ubicacionOriginal && ubicacion
      ? distanciaEnMetros(ubicacionOriginal, ubicacion)
      : 0;

  const textoDistancia = pinFueMovido
    ? `Corregiste el punto ${formatearDistancia(distanciaCorregida)}`
    : precisionGps
      ? `A ${formatearDistancia(precisionGps)} de tu ubicación`
      : "Ubicación desde el GPS";

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
            <Text style={styles.distanciaTexto}>{textoDistancia}</Text>
            <MapView
              style={styles.mapa}
              initialRegion={{
                latitude: ubicacion!.latitud,
                longitude: ubicacion!.longitud,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              <Marker
                coordinate={{
                  latitude: ubicacion!.latitud,
                  longitude: ubicacion!.longitud,
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
