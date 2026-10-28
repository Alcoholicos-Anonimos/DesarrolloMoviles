import { Cuadrilla } from "@/src/tipos";
import { espaciados, estilosComunes, obtenerColores, obtenerColoresEstado, pesosFuente, radios, tamaniosIconos, tipografia } from "@/styles/theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import {  StyleSheet, Text, View } from "react-native";

type Colores = ReturnType<typeof obtenerColores>;
type ColoresEstado = ReturnType<typeof obtenerColoresEstado>;
type Estilos = ReturnType<typeof crearEstilos>;

const crearEstilos = (c: Colores) =>
  StyleSheet.create({
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

export function FilaCuadrilla({ cuadrilla, estilos, colores, coloresEstado,}: {
  cuadrilla: Cuadrilla;
  estilos: Estilos;
  colores: Colores;
  coloresEstado: ColoresEstado;
})
{
  return (
    <View style={[estilosComunes.fila, estilos.filaCuadrilla]}>
      <View style={estilos.iconoCaja}>
        <Ionicons
          name="construct-outline"
          size={tamaniosIconos.medio}
          color={colores.textoSecundario}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={estilos.cuadrillaNombre}>{cuadrilla.nombre}</Text>
        <Text style={estilos.cuadrillaEspecialidad}>
          {cuadrilla.especialidad}
        </Text>
      </View>

      {cuadrilla.activa ? (
        <View
          style={[
            estilos.badge,
            { backgroundColor: coloresEstado.resuelto.fondo },
          ]}
        >
          <Text
            style={[estilos.badgeTexto, { color: coloresEstado.resuelto.texto }]}
          >
            Activa
          </Text>
        </View>
      ) : (
        <View style={[estilos.badge, estilos.badgeInactiva]}>
          <Text style={[estilos.badgeTexto, estilos.textoInactiva]}>
            Inactiva
          </Text>
        </View>
      )}
    </View>
  );
}
