import Icon, { Ionicons } from "@react-native-vector-icons/ionicons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";

import { FilaCuadrilla } from "@/components/cuadrillla/FilaCuadrilla";
import { useAuth } from "@/src/contexto/AuthContext";
import type { Cuadrilla, Zona } from "@/src/tipos";
import {
  espaciados,
  estilosComunes,
  obtenerColores,
  obtenerColoresEstado,
  pesosFuente,
  radios,
  tamaniosIconos,
  tipografia,
} from "@/styles/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip } from "../../components/cuadrillla/Chip";
import { zonasService } from "../../src/servicios/zonas";

type Colores = ReturnType<typeof obtenerColores>;


export default function ZonasScreen() {
   const { usuario, cerrarSesion } = useAuth();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroZona, setFiltroZona] = useState<string | null>(null);

  const tema = useColorScheme() === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const coloresEstado = obtenerColoresEstado(tema);
  const estilos = crearEstilos(colores);

 useEffect(() => {
  (async () => {
    try {
      const resZonas = await zonasService.listarZonas();
      setZonas(resZonas.datos);
      const resCuadrillas = await zonasService.listarCuadrillas();
      setCuadrillas(resCuadrillas.datos);
    } catch (error) {
      console.log("Error:", JSON.stringify(error));
      setError("No pudimos cargar las zonas. Probá de nuevo.");
    } finally {
      setCargando(false);
    }
  })();
}, []);

  if (cargando) {
    return (
      <View style={[estilosComunes.centro]}>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  if (error) {
    return (
       <View style={estilosComunes.centro}>
          <Text style={estilos.textoError}>{error}</Text>
        </View>
    );
  }

  const zonasVisibles = filtroZona
    ? zonas.filter((z) => z.id === filtroZona)
    : zonas;
 const confirmarCerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Querés salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: cerrarSesion },
    ]);
  };
  return (
    <SafeAreaView style={estilos.container}>
      
            <View style={estilos.header}>
              <Text style={estilos.tituloHeader}>Zonas y cuadrillas</Text>
               <Pressable
                          onPress={confirmarCerrarSesion}
                          hitSlop={8}
                          accessibilityLabel="Cerrar sesión"
                        >
                          <Ionicons name="log-out-outline" size={tamaniosIconos.grande} color={colores.texto} />
                        </Pressable>
            </View>

            {/* Filtro por zona */}
            <View style={estilos.filtros}>
              <Chip
                texto="Todas"
                activo={filtroZona === null}
                onPress={() => setFiltroZona(null)}
                estilos={estilos}
              />
              {zonas.map((z) => (
                <Chip
                  key={z.id}
                  texto={z.nombre.replace("Zona ", "")}
                  activo={filtroZona === z.id}
                  onPress={() => setFiltroZona(filtroZona === z.id ? null : z.id)}
                  estilos={estilos}
                />
              ))}
            </View>

            {/* ScrollView porque zonas son solo 4 */}
            <FlatList
            data={zonasVisibles}
            keyExtractor={(zonas) => zonas.id}
            contentContainerStyle={estilos.lista}
            ListEmptyComponent={
              <Text style={estilos.vacio}>No hay zonas cargadas.</Text>
            }
             renderItem={ ({ item: zona}) => {
               const deLaZona = cuadrillas.filter((c) => c.zonaId === zona.id);
              
                return (
                  <View key={zona.id} style={estilos.tarjeta}>
                    <View style={estilosComunes.filaEntre}>
                      <Text style={estilos.tarjetaTitulo}>{zona.nombre}</Text>
                      <View
                        style={[
                          estilos.badge,
                          { backgroundColor: coloresEstado.recibido.fondo },
                        ]}
                      >
                        <Text
                          style={[
                            estilos.badgeTexto,
                            { color: coloresEstado.recibido.texto },
                          ]}
                        >
                          {deLaZona.length}{" "}
                          {deLaZona.length === 1 ? "cuadrilla" : "cuadrillas"}
                        </Text>
                      </View>
                    </View>

                    <View style={[estilosComunes.fila, estilos.referente]}>
                      <Icon
                        name="business-outline"
                        size={tamaniosIconos.pequeno}
                        color={colores.textoSuave}
                      />
                      <Text style={estilos.referenteTexto}>
                        Referente: {zona.referente}
                      </Text>
                    </View>

                    {deLaZona.length === 0 && (
                      <Text style={estilos.sinCuadrillas}>
                        Sin cuadrillas cargadas en esta zona.
                      </Text>
                    )}

                    {deLaZona.map((c) => (
                      <FilaCuadrilla
                        key={c.id}
                        cuadrilla={c}
                        estilos={estilos}
                        colores={colores}
                        coloresEstado={coloresEstado}
                      />
                    ))}
                  </View>
                );
              } }
              />
          
          
          

    </SafeAreaView>
    
  );
}

const crearEstilos = (c: Colores) =>
  StyleSheet.create({
     container: {
      flex: 1,
      backgroundColor: c.fondo,
      paddingHorizontal: espaciados.extraGrande,
    },
   
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: espaciados.grande,
      gap: espaciados.medio,
    },
    tituloHeader: {
      ...tipografia.titulo,
      color: c.texto,
      flex: 1,
    },
    filtros: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: espaciados.pequeno,
      paddingHorizontal: espaciados.grande,
      paddingVertical: espaciados.medio,
    },
    chip: {
      borderWidth: 1,
      borderColor: c.borde,
      borderRadius: radios.pequeno,
      paddingVertical: espaciados.pequeno,
      paddingHorizontal: espaciados.medio,
    },
    chipActivo: {
      backgroundColor: c.primario,
      borderColor: c.primario,
    },
    chipTexto: {
      ...tipografia.textoPequeno,
      color: c.texto,
    },
    chipTextoActivo: {
      color: c.blanco,
    },
    lista: {
      paddingHorizontal: espaciados.grande,
      paddingBottom: espaciados.muyGrande,
    },
    vacio: {
      ...tipografia.textoSecundario,
      color: c.textoSuave,
      textAlign: "center",
      marginTop: espaciados.enorme,
    },
    textoError: {
      ...tipografia.texto,
      color: c.textoPeligro,
      textAlign: "center",
      paddingHorizontal: espaciados.muyGrande,
    },
    tarjeta: {
      backgroundColor: c.superficie,
      borderRadius: radios.medio,
      padding: espaciados.grande,
      marginBottom: espaciados.medio,
      borderWidth: 1,
      borderColor: c.bordeSuave,
    },
    tarjetaTitulo: {
      ...tipografia.tituloSeccion,
      color: c.texto,
    },
    referente: {
      gap: espaciados.xs,
      marginTop: espaciados.xs,
      marginBottom: espaciados.medio,
    },
    referenteTexto: {
      ...tipografia.textoPequeno,
      color: c.textoSuave,
    },
    badge: {
      borderRadius: radios.pequeno,
      paddingHorizontal: espaciados.pequeno,
      paddingVertical: 2,
    },
    badgeTexto: {
      ...tipografia.textoPequeno,
    },
    badgeInactiva: {
      backgroundColor: c.superficieSecundaria,
    },
    textoInactiva: {
      color: c.textoSecundario,
    },
    sinCuadrillas: {
      ...tipografia.textoPequeno,
      color: c.textoSuave,
      paddingTop: espaciados.medio,
      borderTopWidth: 1,
      borderTopColor: c.bordeSuave,
    },
    filaCuadrilla: {
      gap: espaciados.medio,
      paddingVertical: espaciados.medio,
      borderTopWidth: 1,
      borderTopColor: c.bordeSuave,
    },
    iconoCaja: {
      width: 32,
      height: 32,
      borderRadius: radios.pequeno,
      backgroundColor: c.superficieSecundaria,
      alignItems: "center",
      justifyContent: "center",
    },
    cuadrillaNombre: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: c.texto,
    },
    cuadrillaEspecialidad: {
      ...tipografia.textoPequeno,
      color: c.textoSecundario,
    },
  });