import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Reporte, TipoDeReporte, EstadoReporte } from '../../src/tipos';
import { reportesService } from '../../src/servicios/reportes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { espaciados, estiloMapaOscuro, estilosComunes, obtenerColores, obtenerColoresEstado, pesosFuente, radios, tipografia } from "@/styles/theme";

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


export default function MapaScreen() {
  const colorScheme = useColorScheme();
  //Creamos el estilo segun el color del modo del dispositivo 
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const coloresEstado = obtenerColoresEstado(tema);
  const styles = crearStyles(tema);

  //Reportes generados por los usuarios
  const [reportes, setReportes] = useState<Reporte[]>([]);

  //Tipo de reporte: bache, luminaria, basura, rama o árbol, agua o cloaca,semáforo, vereda, otro.
  const [tipos, setTipos] = useState<string[]>([]);

  //Filtro: tipo seleccionado 
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");

  //Estado si está cargando los datos del mapa o dio error
  const [cargando, setCargando] = useState(true);

  //ubicacion del mapa por defecto Gualeguaychú
  //latitudeDelta y longitudeDelta indican cuánto territorio se muestra alrededor de la coordenada central del mapa.
  const [ubicacion, setUbicacion] = useState<Region>({
    latitude: -33.0069,
    longitude: -58.5142,
    latitudeDelta: 0.009,
    longitudeDelta: 0.00999,
  });

  // Carga asíncrona desde la capa de servicios
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [respReportes, respTipos] = await Promise.all([
          reportesService.obtenerMisReportes(),
          reportesService.obtenerTipos(),
        ]);
        setReportes(respReportes.datos);
        //console.log("reports  ", respReportes.datos);
        //En tipos solo me quedo con los titulos
        setTipos(respTipos.map((t: any) => t.nombre));

      } catch (error) {
        console.error('Error al cargar el mapa:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);




  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mapa de la ciudad</Text>
      </View>
      <View >
        <View style={styles.chipsContainer}>
          {tipos.map((tipo) => {
            const estaSeleccionado = tipo === tipoSeleccionado;
            return (
              <Pressable key={tipo} onPress={() => setTipoSeleccionado(tipo)} style={[styles.chip, estaSeleccionado && styles.chipSeleccionado,]} >
                <Text style={[styles.chipTexto, estaSeleccionado && styles.chipSeleccionado,]} >  {tipo} </Text>
              </Pressable>
            );
          })}

        </View>

        <View style={[{ padding: 10, marginTop: 10, }]}>
          <MapView style={[styles.map]}
            initialRegion={ubicacion}
            customMapStyle={colorScheme === "dark" ? estiloMapaOscuro : []}
          >
            {reportes.map((r) => (
              <Marker
                key={r.id} coordinate={{ latitude: r.coordenadas.latitud, longitude: r.coordenadas.longitud, }}
                title={r.descripcion === null ? "Sin descripción" : r.descripcion}
                description={obtenerInfoEstado(r.estado, coloresEstado).label}
                pinColor={obtenerInfoEstado(r.estado, coloresEstado).color} >

                <View style={[styles.pin, { backgroundColor: obtenerInfoEstado(r.estado, coloresEstado).color },]}  >
                  <Ionicons
                    name={(obtenerIcono(r.tipoId)) as any}
                    size={16}
                    color={colores.blanco}
                  />
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

       
        <View style={[styles.tarjeta,]} >
          <Text style={[styles.tarjetaTitulo]} >  Ya existen 2 reportes a menos de 50m. Es el mismo problema?  </Text>
          <View style={styles.tarjetaBotones} >
            <Pressable style={[styles.botonPrimario,]} >
              <Text style={[styles.textoBotonPrimario, ,]} > Sumarse </Text>
            </Pressable>
            <Pressable style={[styles.botonPrimario,]}  >
              <Text style={[styles.textoBotonPrimario,]} > Es otro problema </Text>
            </Pressable>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({

    container: {
      flex: 1,
      paddingHorizontal: espaciados.extraGrande,
      backgroundColor: colores.fondo,
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

    map: {
      width: "85%",
      height: "85%",

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
    },

    filtros: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: espaciados.pequeno,
      padding: espaciados.pequeno,
      backgroundColor: colores.fondo,
    },

    chip: {
      borderWidth: 0.5,
      borderColor: colores.borde,
      borderRadius: radios.pequeno,
      paddingVertical: 6,
      paddingHorizontal: espaciados.medio,
    },

    chipActivo: {
      backgroundColor: colores.primario,
      borderColor: colores.primario,
    },

    chipTexto: {
      ...tipografia.texto,
      color: colores.texto,
    },

    chipTextoActivo: {
      ...tipografia.texto,
      color: colores.fondo,
    },

    avisoPermiso: {
      position: "absolute",
      top: 60,
      left: 14,
      right: 14,
      backgroundColor: colores.fondoAdvertencia,
      borderRadius: radios.pequeno,
      padding: espaciados.pequeno,
    },

    chipsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: espaciados.pequeno,
    },

    chipSeleccionado: {
      backgroundColor: colores.peligroSuave,
      borderColor: colores.peligro,
    },

    chipTextSeleccionado: {
      ...tipografia.texto,
      color: colores.textoPeligro,
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

  });
};