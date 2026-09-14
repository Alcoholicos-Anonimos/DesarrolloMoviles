import { useEffect,  useState } from "react";
import {View,Text, Pressable,StyleSheet,ActivityIndicator, } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Reporte, TipoDeReporte, EstadoReporte } from '../../src/tipos';
import { reportesService } from '../../src/servicios/reportes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from "@react-native-vector-icons/ionicons";

const obtenerInfoEstado = (estado: EstadoReporte) => {
  switch (estado) {
    case 'asignado':
      return { label: 'Asignado', color: '#D97706' }; // Ámbar/Naranja
    case 'resuelto':
      return { label: 'Resuelto', color: '#16A34A' }; // Verde
    case 'rechazado':
      return { label: 'Rechazado', color: '#DC2626' }; // Rojo
    case 'en_revision':
      return { label: 'En revisión', color: '#3B82F6' }; // Azul
    case 'recibido':
    default:
      return { label: 'Recibido', color: '#9CA3AF' }; // Gris
  }
};

const obtenerIcono = (tipoId : string) => {
  switch (tipoId) { 
    case 'tip-bache': return 'warning-outline';
      case 'tip-luz': return 'flash-off-outline';
      case 'tip-rama': return 'leaf-outline';
      case 'tip-basura':  return 'trash-outline';
      case 'tip-agua':  return 'water-outline';
      case 'tip-otro': return 'ellipsis-horizontal-outline';
  }
};


export default function MapaScreen() {
   const colorScheme = useColorScheme();
   //Creamos el estilo segun el color del modo del dispositivo 
   const styles = crearStyles(colorScheme ?? 'light');

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
        <ActivityIndicator  size="large"  />
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
              <Pressable key={tipo}  onPress={() => setTipoSeleccionado(tipo)}  style={[ styles.chip,  estaSeleccionado && styles.chipSeleccionado,  ]} >
                <Text style={[ styles.chipTexto, estaSeleccionado && styles.chipSeleccionado, ]} >  {tipo} </Text>
              </Pressable>
            );
          })}
                
        </View> 
        
        <View style={[{ padding: 10,  marginTop: 10, }]}>
            <MapView style={[styles.map]} 
              initialRegion={ubicacion} >
              {reportes.map((r) => (
                <Marker
                  key={r.id}  coordinate={{ latitude: r.coordenadas.latitud, longitude: r.coordenadas.longitud, }}
                  title={r.descripcion === null ? "Sin descripción" : r.descripcion}
                  description={obtenerInfoEstado(r.estado).label}
                  pinColor={obtenerInfoEstado(r.estado).color} >

                    <View style={[  styles.pin, { backgroundColor: obtenerInfoEstado(r.estado).color }, ]}  >
                      <Ionicons
                        name={(obtenerIcono(r.tipoId)) as any}
                        size={16}
                        color="#fff"
                      />
                    </View>
                  </Marker>
              ))}
            </MapView>
        </View>
        <View  style={[ styles.tarjeta, { backgroundColor: Colors[colorScheme ?? 'light'].background }, ]} >
          <Text style={[ styles.tarjetaTitulo, { color: Colors[colorScheme ?? 'light'].text }, ]} >  Ya existen 2 reportes a menos de 50m. Es el mismo problema?  </Text>
          <View style={styles.tarjetaBotones} >
              <Pressable style={[ styles.botonPrimario,   ]} > 
                <Text style={[ styles.textoBotonPrimario, { color: Colors[colorScheme ?? 'light'].text }, ]} > Sumarse </Text> 
                </Pressable>
              <Pressable style={[ styles.botonPrimario,   ]}  > 
                <Text style={[ styles.textoBotonPrimario, { color: Colors[colorScheme ?? 'light'].text }, ]} > Es otro problema </Text> 
                </Pressable>
            </View>
         </View>
        
        </View>
   </SafeAreaView>
  );
}


const crearStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
   header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,

  },
   titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colorScheme === 'light' ? '#000000' : '#FFFFFF',
  }, 
   map: {
    width: '85%',
    height: '85%',
  },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },
  textoError: { fontSize: 14, color: "#791F1F" },
  filtros: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    padding: 10,
    backgroundColor: "#fff",
  },
  chip: {
    borderWidth: 0.5,
    borderColor: "#c9c7bd",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  chipActivo: { backgroundColor: "#26215c", borderColor: "#26215c" },
  chipTexto: { fontSize: 14, color: colorScheme === 'light' ? '#000000' : '#FFFFFF' },
  chipTextoActivo: { fontSize: 14, color: colorScheme === 'light' ? '#000000' : '#FFFFFF',},
  avisoPermiso: {
    position: "absolute",
    top: 60,
    left: 14,
    right: 14,
    backgroundColor: "#faeeda",
    borderRadius: 8,
    padding: 10,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
   
  },
 
  chipSeleccionado: {
    backgroundColor: colorScheme === 'light' ? '#FFFFF' : '#000000',
    borderColor: "#c0392b",
  },
 
  chipTextSeleccionado: {
    color: "#e74c3c",
  },
  textoAvisoPermiso: { fontSize: 12, color: "#633806" },
  linkAvisoPermiso: { fontSize: 12, color: "#0C447C", marginTop: 6 },
  tarjeta: {
    position: "absolute",
    bottom: 20,
    left: 14,
    right: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 3,
  },
  tarjetaTitulo: { fontSize: 14, fontWeight: "500" },
  tarjetaSubtitulo: { fontSize: 12, color: "#888780", marginBottom: 10 },
  tarjetaBotones: { flexDirection: "row", gap: 8 },
  botonSecundario: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#c9c7bd",
    alignItems: "center",
  },
  botonPrimario: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#26215c",
    alignItems: "center",
  },
  textoBotonPrimario: { color: "#fff", fontSize: 13, fontWeight: "500" },
 
});
